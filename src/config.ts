import { type SomeCompanionConfigField, DropdownChoice } from '@companion-module/base'
import { ModuleInstance } from './main.js'

export interface ModuleConfig {
	inPort: number
	outPort: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	const inPortNames: DropdownChoice[] = [{ id: -1, label: '-NONE-' }]
	const outPortNames: DropdownChoice[] = [{ id: -1, label: '-NONE-' }]
	let portNum = 0
	for (portNum = 0; portNum < ModuleInstance.midiInput.getPortCount(); portNum++) {
		const portName: string = ModuleInstance.midiInput.getPortName(portNum)
		console.log(`MIDI Input  Port #${portNum} = "${portName}"`)
		inPortNames.push({ id: portNum, label: portName })
	}
	for (portNum = 0; portNum < ModuleInstance.midiOutput.getPortCount(); portNum++) {
		const portName: string = ModuleInstance.midiOutput.getPortName(portNum)
		console.log(`MIDI Output Port #${portNum} = "${portName}"`)
		outPortNames.push({ id: portNum, label: portName })
	}
	console.log('\n')

	return [
		{
			type: 'dropdown',
			id: 'inPort',
			label: 'MIDI In',
			width: 8,
			default: -1,
			choices: inPortNames,
		},
		{
			type: 'dropdown',
			id: 'outPort',
			label: 'MIDI Out',
			width: 8,
			default: -1,
			choices: outPortNames,
		},
	]
}
