import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import * as midi from '@julusian/midi'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	static midiInput: midi.Input = new midi.Input()
	static midiOutput: midi.Output = new midi.Output()

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.start()
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		ModuleInstance.midiInput.destroy()
		ModuleInstance.midiOutput.destroy()
		this.log('debug', 'destroyed')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		ModuleInstance.midiInput.closePort()
		ModuleInstance.midiOutput.closePort()
		this.config = config
		console.log(`In  Port # =  ${this.config.inPort}`)
		console.log(`Out Port # = ${this.config.outPort}`)
		if (this.config.inPort >= 0) ModuleInstance.midiInput.openPort(this.config.inPort)
		if (this.config.outPort >= 0) ModuleInstance.midiOutput.openPort(this.config.outPort)
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
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
