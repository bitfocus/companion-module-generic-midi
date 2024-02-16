import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import * as easymidi from '../node-easymidi/index.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	midiInput!: easymidi.Input
	midiOutput!: easymidi.Output

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		await this.configUpdated(config)
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.midiInput.close()
		this.midiOutput.close()
		this.log('debug', 'destroyed')
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
		console.log(`Selected In  Port "${this.midiInput.name}" is ${this.midiInput.isPortOpen() ? '' : 'NOT '}Open.`)
		console.log(`Selected Out Port "${this.midiOutput.name}" is ${this.midiOutput.isPortOpen() ? '' : 'NOT '}Open.`)
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
		console.log('Entering *main*')
		this.midiInput.on('smpte', (msg) => {
			this.setVariableValues({
				smpte: msg.smpte,
				frameRate: msg.frameRate,
			})
		})
		this.midiInput.on('message', (msg) => {
			console.log(msg)
		})
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
