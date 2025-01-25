import { SomeCompanionActionInputField, SomeCompanionFeedbackInputField } from '@companion-module/base'

interface midiMsgType {
	id: string
	label: string
	desc: string
	valId: string
	valLabel: string
	valMin: number
	valMax: number
	valDefault: number
}

export const midiMsgTypes: midiMsgType[] = [
	{
		id: 'noteoff',
		label: 'Note Off',
		desc: 'Note Off Messsage',
		valId: 'velocity',
		valLabel: 'Velocity',
		valMin: 0,
		valMax: 127,
		valDefault: 0,
	},
	{
		id: 'noteon',
		label: 'Note On',
		desc: 'Note On Message',
		valId: 'velocity',
		valLabel: 'Velocity',
		valMin: 0,
		valMax: 127,
		valDefault: 127,
	},
	//		{ id: 'aftertouch', name: 'Aftertouch' },
	{
		id: 'cc',
		label: 'CC',
		desc: 'Control Change Message',
		valId: 'value',
		valLabel: 'Value',
		valMin: 0,
		valMax: 127,
		valDefault: 0,
	},
	{
		id: 'program',
		label: 'Program Change',
		desc: 'Program Change Message',
		valId: 'program',
		valLabel: 'Program Number',
		valMin: 1,
		valMax: 128,
		valDefault: 1,
	},
	//		{ id: 'channelpressure', 	name: 'Channel Pressure' },
	{
		id: 'pitch',
		label: 'Pitch Wheel',
		desc: 'Pitch Wheel Message',
		valId: 'value',
		valLabel: 'Value',
		valMin: 0,
		valMax: 16383,
		valDefault: 8192,
	},
	{
		id: 'sysex',
		label: 'SysEx',
		desc: 'System Exclusive Message',
		valId: 'bytes',
		valLabel: 'SysEx Bytes',
		valMin: 0,
		valMax: 127,
		valDefault: 0,
	},
	//		{ id: 'mtc', 				name: 'MIDI Time Code' },
	//		{ id: 'position',			name: 'Song Position Pointer' },
	//		{ id: 'select',				name: 'Song Select' },
	//		{ id: 'tune',				name: 'Tune Request' },
	//		{ id: 'sysex end',			name: 'SysEx End' },
	//		{ id: 'clock',				name: 'Clock' },
	//		{ id: 'start',				name: 'Start' },
	//		{ id: 'continue',			name: 'Continue' },
	//		{ id: 'stop',				name: 'Stop' },
	//		{ id: 'activesense',		name: 'Active Sensing' },
	//		{ id: 'reset',				name: 'Reset' },
]

type optionTypes = SomeCompanionActionInputField[] | SomeCompanionFeedbackInputField[]

export function createOptions(newOpts: optionTypes, midiOp: midiMsgType): optionTypes {
	if (['noteoff', 'noteon', 'cc', 'program', 'pitch'].includes(midiOp.id)) {
		newOpts.push(
			{
				id: 'channel',
				type: 'number',
				label: 'Channel',
				default: 1,
				min: 1,
				max: 16,
				isVisible: (opts) => !opts.useVariables,
			},
			{
				id: 'chValue',
				type: 'textinput',
				label: 'Channel',
				default: '1',
				useVariables: true,
				isVisible: (opts) => {
					if (!opts.chValue) opts.chValue = opts.channel
					return !!opts.useVariables
				},
			},
		)
	}
	if (['noteoff', 'noteon'].includes(midiOp.id)) {
		newOpts.push(
			{
				id: 'note',
				type: 'number',
				label: 'Note Number',
				default: 60,
				min: 0,
				max: 127,
				isVisible: (opts) => !opts.useVariables,
			},
			{
				id: 'noteValue',
				type: 'textinput',
				label: 'Note Number',
				default: '60',
				useVariables: true,
				isVisible: (opts) => {
					if (!opts.noteValue) opts.noteValue = opts.note
					return !!opts.useVariables
				},
			},
		)
	}
	if (midiOp.id == 'cc') {
		newOpts.push(
			{
				id: 'controller',
				type: 'number',
				label: 'Controller',
				default: 127,
				min: 0,
				max: 127,
				isVisible: (opts) => !opts.useVariables,
			},
			{
				id: 'ccValue',
				type: 'textinput',
				label: 'Controller',
				default: '127',
				useVariables: true,
				isVisible: (opts) => {
					if (!opts.ccValue) opts.ccValue = opts.controller
					return !!opts.useVariables
				},
			},
		)
	}
	if (midiOp.id != 'sysex') {
		newOpts.push(
			{
				id: midiOp.valId,
				type: 'number',
				label: midiOp.valLabel,
				default: midiOp.valDefault,
				min: midiOp.valMin,
				max: midiOp.valMax,
				isVisible: (opts) => !opts.useVariables && !opts.relValue,
			},
			{
				id: 'varValue',
				type: 'textinput',
				label: midiOp.valLabel,
				default: String(midiOp.valDefault),
				useVariables: true,
				isVisible: (opts) => {
					return (!!opts.useVariables || !!opts.relValue) && !opts.createVar
				},
				required: true,
			},
			{
				id: 'useVariables',
				type: 'checkbox',
				label: 'Use Variables',
				default: false,
			},
		)
	} else {
		newOpts.push({
			id: 'bytes',
			type: 'textinput',
			label: midiOp.valLabel,
			tooltip:
				'Enter a string of decimal or hex digits, with spaces or commas between. MUST start with 0xF0 or 240 and end with 0xF7 or 247',
			default: '',
			useVariables: true,
		})
	}

	return newOpts
}
