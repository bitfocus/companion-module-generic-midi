import { type SomeCompanionConfigField, DropdownChoice } from '@companion-module/base'
import { getInputs, getOutputs } from './midi/midi.js'

export interface ModuleConfig {
	inPort: string
	outPort: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	const inPortNames: DropdownChoice[] = []
	const outPortNames: DropdownChoice[] = []
	const inPorts: string[] = getInputs()
	const outPorts: string[] = getOutputs()
	inPorts.forEach((m) => {
		inPortNames.push({ id: m, label: m })
	})
	outPorts.forEach((m) => {
		outPortNames.push({ id: m, label: m })
	})
	return [
		{
			type: 'dropdown',
			id: 'inPort',
			label: 'MIDI In',
			width: 6,
			default: inPorts[0] || 'NONE DETECTED',
			choices: inPortNames,
		},
		{
			type: 'dropdown',
			id: 'outPort',
			label: 'MIDI Out',
			width: 6,
			default: outPorts[0] || 'NONE DETECTED',
			choices: outPortNames,
		},
	]
}
