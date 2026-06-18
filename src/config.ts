import { type SomeCompanionConfigField, JsonObject, DropdownChoice } from '@companion-module/base'
import { getInputs, getOutputs } from './midi/midi.js'

export interface ModuleConfig extends JsonObject {
	inPortName: string
	inPortVirtualName: string
	inPortIsVirtual: boolean
	outPortName: string
	outPortVirtualName: string
	outPortIsVirtual: boolean
	useTimeStamp: boolean
	autoCreateVars: boolean
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
			id: 'inPortName',
			label: 'MIDI In',
			width: 6,
			default: inPorts[0] || 'NONE DETECTED',
			choices: inPortNames,
			//	isVisible: (opts) => !opts.inPortIsVirtual,
		},
		/*
		{
			type: 'textinput',
			id: 'inPortVirtualName',
			label: 'MIDI In',
			width: 6,
			default: '',
			isVisible: (opts) => !!opts.inPortIsVirtual,
		},
		{
			type: 'checkbox',
			id: 'inPortIsVirtual',
			label: 'Virtual',
			width: 6,
			default: false,
		},
		*/
		{
			type: 'dropdown',
			id: 'outPortName',
			label: 'MIDI Out',
			width: 6,
			default: outPorts[0] || 'NONE DETECTED',
			choices: outPortNames,
			//	isVisible: (opts) => !opts.outPortIsVirtual,
		},
		/*
		{
			type: 'textinput',
			id: 'outPortVirtualName',
			label: 'MIDI Out',
			width: 6,
			default: '',
			isVisible: (opts) => !!opts.outPortIsVirtual,
		},
		{
			type: 'checkbox',
			id: 'outPortIsVirtual',
			label: 'Virtual',
			width: 6,
			default: false,
		},
		{
			type: 'static-text',
			id: 'customText',
			label: 'Choose existing ports, or type a custom name to create a Virtual Port',
			width: 12,
			value: '',
		},
		*/
		{
			type: 'checkbox',
			id: 'useTimeStamp',
			label: 'Use TimeStamp with Action Recorder',
			tooltip: 'Enable this setting to include the delay time for actions created in Action Recorder',
			width: 6,
			default: false,
		},
		{
			type: 'checkbox',
			id: 'autoCreateVars',
			label: 'Enable "Auto-Created Variables function"',
			tooltip: 'Enable this setting ONLY if you need compatibility with existing Auto-Created variables',
			width: 6,
			default: false,
		},
		{
			type: 'static-text',
			id: 'autoCreateVarNotice',
			label: '*** Support for the deprecated "Auto-Created Variable" function ***',
			value:
				'The "Auto-Create Variable" function has now been superceded by the built-in Local Variables feature within Companion 4.2+.<br>If you still have auto-created variables, please change them to Value Feedbacks as support for Auto-Created Variables may disappear in the future!',
			tooltip: 'Enable this setting ONLY if you need compatibility with existing Auto-Created variables',
			width: 12,
		},
	]
}
