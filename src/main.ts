import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import * as easymidi from '../node-easymidi/index.js'

export interface DataStoreEntry {
	key: number
	val: number
}

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	midiInput!: easymidi.Input
	midiOutput!: easymidi.Output
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
		console.log('Available MIDI Inputs:', easymidi.getInputs())
		console.log('Available MIDI Outputs:', easymidi.getOutputs())
		console.log('\n')
		this.config = config
		if (this.midiInput) this.midiInput.close()
		if (this.midiOutput) this.midiOutput.close()
		this.midiInput = new easymidi.Input(this.config.inPort)
		this.midiOutput = new easymidi.Output(this.config.outPort)
		let midiInStatus = this.midiInput.isPortOpen()
		let midiOutStatus = this.midiOutput.isPortOpen()
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
		this.setVariableValues({midiData: false})

		this.midiInput.on('smpte', (args) => {
			this.setVariableValues({
				smpte: args.smpte,
				smpteFR: args.frameRate,
			})
		})
		this.midiInput.on('message', (args) => {
			clearTimeout(midiInTimer)
			midiInTimer = setTimeout(() => {
				this.setVariableValues({midiInData: false})		
			}, 200)			
			this.setVariableValues({midiInData: true})
			if (args._type !== 'mtc') {
				var msgAsBytes: number[] = easymidi.parseMessage(String(args._type), args)
				var message = easymidi.parseBytes(msgAsBytes)
				this.log('debug', `Received: ${JSON.stringify(message)} from ${this.midiInput.name}`)
				this.addToDataStore(msgAsBytes)
				if (this.isRecordingActions) this.addToActionRecording(message)
			}
		})
	}

	addToDataStore(bytes: number[]): void {
		var data: DataStoreEntry= this.getDataFromBytes(bytes)
		if (data.key > 0) {
			this.dataStore.set(data.key, data.val)
console.log('addToDataStore: dataStore = ', this.dataStore)
			this.checkFeedbacks()
		}
	}

	getFromDataStore(bytes: number[]): number | undefined {
		var data: DataStoreEntry = this.getDataFromBytes(bytes)
		if (data.key > 0) {
			return this.dataStore.get(data.key)
		}
		return undefined
	}

	getDataFromBytes(bytes: number[]): DataStoreEntry {
		var lastIndex: number = bytes.length - 1
		var parsedKey: number = 0
		var parsedVal: number = 0
		if (lastIndex >= 0 && bytes[0] < 0xF0) {
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
	addToActionRecording(c: any): void {
		if (c.args.channel !== undefined) c.args.channel++
		if (c.args.number !== undefined) c.args.number++
		c.args = { ...c.args, useVariables: false }
		this.recordAction(
			{
				actionId: c.type,
				options:  c.args,
			},
			`${c.type} ${c.args}` // uniqueId to stop duplicates
		)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
