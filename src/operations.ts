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
		newOpts.push({
			id: 'channel',
			type: 'number',
			label: 'Channel',
			default: 1,
			min: 1,
			max: 16,
		})
	}
	if (['noteoff', 'noteon'].includes(midiOp.id)) {
		newOpts.push({
			id: 'note',
			type: 'number',
			label: 'Note Number',
			default: 60,
			min: 0,
			max: 127,
		})
	}
	if (midiOp.id == 'cc') {
		newOpts.push({
			id: 'controller',
			type: 'number',
			label: 'Controller',
			default: 127,
			min: 0,
			max: 127,
		})
	}
	if (midiOp.id != 'sysex') {
		newOpts.push({
			id: midiOp.valId,
			type: 'number',
			label: midiOp.valLabel,
			default: midiOp.valDefault,
			min: midiOp.valMin,
			max: midiOp.valMax,
		})
	} else {
		newOpts.push({
			id: 'bytes',
			type: 'textinput',
			label: midiOp.valLabel,
			tooltip:
				'Enter a string of decimal or hex digits, with spaces or commas between. MUST start with 0xF0 or 240 and end with 0xF7 or 247',
			default: '',
		})
	}

	return newOpts
}
