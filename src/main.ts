import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions, HandleMidiIndicators } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import * as midi from './midi/midi.js'
import { MidiMessage } from './midi/msgtypes.js'

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

		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
		this.updateVariableDefinitions()
		await this.configUpdated(config)
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.midiInput.close()
		this.midiOutput.close()
		this.log('debug', `${this.id} destroyed`)
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		const inPortName = this.config.inPortIsVirtual ? this.config.inPortVirtualName : this.config.inPortName
		const outPortName = this.config.outPortIsVirtual ? this.config.outPortVirtualName : this.config.outPortName
		console.log('Available MIDI Inputs:', midi.getInputs(), 'Selected: ', inPortName)
		console.log('Available MIDI Outputs:', midi.getOutputs(), 'Selected: ', outPortName)
		console.log('\n')
		this.config = config
		if (this.midiInput) this.midiInput.close()
		if (this.midiOutput) this.midiOutput.close()
		this.midiInput = new midi.Input(inPortName, this.config.inPortIsVirtual)
		this.midiOutput = new midi.Output(outPortName, this.config.outPortIsVirtual)
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

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	// The main loop
	start(): void {
		console.log('\nEntering *main*\n')

		this.midiInput.on('smpte', (args: { smpte: string; smpteFR: number }) => {
			this.setVariableValues({
				smpte: args.smpte,
				smpteFR: args.smpteFR,
			})
		})
		this.midiInput.on('message', (deltaTime: number, msg: MidiMessage) => {
			HandleMidiIndicators(this, 'midiInData')
			if (msg.id !== 'mtc') {
				this.log('debug', `Received: ${msg} from "${this.midiInput.name}"`)
				this.addToDataStore(msg)
				if (this.isRecordingActions) this.addToActionRecording(deltaTime, msg)
			}
		})
	}

	addToDataStore(msg: MidiMessage): void {
		const data: DataStoreEntry = this.getValFromMsg(msg)
		if (data.key > 0) {
			this.dataStore.set(data.key, data.val)
			this.checkFeedbacks()
		}
	}

	getFromDataStore(msg: MidiMessage): number | undefined {
		const data: DataStoreEntry = this.getValFromMsg(msg)
		if (data.key > 0) {
			return this.dataStore.get(data.key)
		}
		return undefined
	}

	getValFromMsg(msg: MidiMessage): DataStoreEntry {
		const lastIndex: number = msg.bytes.length - 1
		let parsedKey = 0
		let parsedVal = 0
		// val is last byte, key is all bytes up to the last
		// e.g. [0x90, 0x60, 0x7F]: key = 0x9060, val = 0x7F
		if (lastIndex >= 0 && msg.status < 0xf0) {
			parsedVal = msg.bytes[lastIndex]
			for (let i = 0; i < lastIndex; i++) {
				parsedKey += msg.bytes[i] << ((lastIndex - i - 1) << 3)
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
	addToActionRecording(deltaTime: number, msg: MidiMessage): void {
		const args = { ...msg.args, useVariables: false }
		if (args.channel !== undefined) args.channel++
		if (args.number !== undefined) args.number++
		this.recordAction(
			{
				actionId: msg.id,
				options: args,
			}
			//			`${msg.id} ${this.getValFromMsg(msg).key}` // uniqueId to stop duplicates?
		)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
