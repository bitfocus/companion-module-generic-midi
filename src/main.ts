import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import * as midi from './midi/index.js'

export interface DataStoreEntry {
	key: number
	val: number
}

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	midiInput!: midi.Input
	midiOutput!: midi.Output
	dataStore!: Map<number, number>
	isRecordingActions!: boolean

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.dataStore = new Map()

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		await this.configUpdated(config)
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.midiInput.close()
		this.midiOutput.close()
		this.log('debug', `${this.id} destroyed`)
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		console.log('Available MIDI Inputs:', midi.getInputs())
		console.log('Available MIDI Outputs:', midi.getOutputs())
		console.log('\n')
		this.config = config
		if (this.midiInput) this.midiInput.close()
		if (this.midiOutput) this.midiOutput.close()
		this.midiInput = new midi.Input(this.config.inPort)
		this.midiOutput = new midi.Output(this.config.outPort)
		const midiInStatus = this.midiInput.isPortOpen()
		const midiOutStatus = this.midiOutput.isPortOpen()
		this.log('info', `Selected In  Port "${this.midiInput.name}" is ${midiInStatus ? '' : 'NOT '}Open.`)
		this.log('info', `Selected Out Port "${this.midiOutput.name}" is ${midiOutStatus ? '' : 'NOT '}Open.`)
		if (midiInStatus && midiOutStatus) {
			this.updateStatus(InstanceStatus.Ok)
		} else {
			if (!midiInStatus && midiOutStatus) this.updateStatus(InstanceStatus.BadConfig, 'MIDI In Port not open')
			else if (midiInStatus && !midiOutStatus) this.updateStatus(InstanceStatus.BadConfig, 'MIDI Out Port not open')
			else this.updateStatus(InstanceStatus.Disconnected)
		}

		this.start()
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	// The main loop
	start(): void {
		console.log('\nEntering *main*\n')

		let midiInTimer: NodeJS.Timeout
		this.setVariableValues({ midiData: false })

		this.midiInput.on('smpte', (args: { smpte: string; smpteFR: number }) => {
			this.setVariableValues({
				smpte: args.smpte,
				smpteFR: args.smpteFR,
			})
		})
		this.midiInput.on('message', (args: midi.MsgArgs) => {
			clearTimeout(midiInTimer)
			midiInTimer = setTimeout(() => {
				this.setVariableValues({ midiInData: false })
			}, 200)
			this.setVariableValues({ midiInData: true })
			if (args._type !== 'mtc') {
				const msgAsBytes: number[] = midi.parseMessage(String(args._type), args)!
				const message = midi.parseBytes(msgAsBytes)
				this.log('debug', `Received: ${JSON.stringify(message)} from ${this.midiInput.name}`)
				this.addToDataStore(msgAsBytes)
				if (this.isRecordingActions) this.addToActionRecording(message)
			}
		})
	}

	addToDataStore(bytes: number[]): void {
		const data: DataStoreEntry = this.getDataFromBytes(bytes)
		if (data.key > 0) {
			this.dataStore.set(data.key, data.val)
			//			console.log('addToDataStore: dataStore = ', this.dataStore)
			this.checkFeedbacks()
		}
	}

	getFromDataStore(bytes: number[]): number | undefined {
		const data: DataStoreEntry = this.getDataFromBytes(bytes)
		if (data.key > 0) {
			return this.dataStore.get(data.key)
		}
		return undefined
	}

	getDataFromBytes(bytes: number[]): DataStoreEntry {
		const lastIndex: number = bytes.length - 1
		let parsedKey = 0
		let parsedVal = 0
		if (lastIndex >= 0 && bytes[0] < 0xf0) {
			parsedVal = bytes[lastIndex]
			for (let i = 0; i < lastIndex; i++) {
				parsedKey += bytes[i] << ((lastIndex - i - 1) << 3)
			}
			if (parsedKey == 0) parsedKey = parsedVal
		}
		return { key: parsedKey, val: parsedVal }
	}

	// Track whether actions are being recorded
	handleStartStopRecordActions(isRecording: boolean): void {
		this.isRecordingActions = isRecording
	}

	// Add a command to the Action Recorder
	addToActionRecording(c: { type: string | undefined; args: midi.MsgArgs }): void {
		const args = { ...c.args, useVariables: false }
		if (args.channel !== undefined) args.channel++
		if (args.number !== undefined) args.number++
		this.recordAction(
			{
				actionId: c.type!,
				options: args,
			},
			`${c.type} ${c.args}` // uniqueId to stop duplicates
		)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
