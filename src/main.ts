import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import * as midi from 'easymidi'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	midiInput!: midi.Input
	midiOutput!: midi.Output

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
		this.start()
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.midiInput.close()
		this.midiOutput.close()
		this.log('debug', 'destroyed')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		console.log('MIDI Inputs:', midi.getInputs())
		console.log('MIDI Outputs:', midi.getOutputs())
		console.log('\n')
		this.config = config
		this.midiInput = new midi.Input(this.config.inPort)
		this.midiOutput = new midi.Output(this.config.outPort)
		console.log(`Selected In  Port : ${this.config.inPort}`)
		console.log(`Selected Out Port : ${this.config.outPort}`)
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
		this.midiInput.on('message', (msg) => {
			console.log(msg)
		})
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
