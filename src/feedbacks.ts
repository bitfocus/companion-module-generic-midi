import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { DropdownChoice } from '@companion-module/base'
import * as midi from './midi/index.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	const midiMsgTypes: DropdownChoice[] = [
		{ id: 'noteoff', label: 'Note Off' },
		{ id: 'noteon', label: 'Note On' },
		//		{ id: 'aftertouch', 		label: 'Aftertouch' },
		{ id: 'cc', label: 'CC' },
		{ id: 'program', label: 'Program Change' },
		//		{ id: 'channelpressure', 	label: 'Channel Pressure' },
		{ id: 'pitch', label: 'Pitch Wheel' },
		{ id: 'sysex', label: 'SysEx' },
		//		{ id: 'mtc', 				label: 'MIDI Time Code' },
		//		{ id: 'position',			label: 'Song Position Pointer' },
		//		{ id: 'select',				label: 'Song Select' },
		//		{ id: 'tune',				label: 'Tune Request' },
		//		{ id: 'sysex end',			label: 'SysEx End' },
		//		{ id: 'clock',				label: 'Clock' },
		//		{ id: 'start',				label: 'Start' },
		//		{ id: 'continue',			label: 'Continue' },
		//		{ id: 'stop',				label: 'Stop' },
		//		{ id: 'activesense',		label: 'Active Sensing' },
		//		{ id: 'reset',				label: 'Reset' },
	]

	self.setFeedbackDefinitions({
		receive_message: {
			name: 'Receive MIDI Message',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'msgType',
					type: 'dropdown',
					label: 'Message Type',
					default: 'noteon',
					minChoicesForSearch: 0,
					choices: midiMsgTypes,
				},
				{
					id: 'channel',
					type: 'number',
					label: 'Channel',
					default: 1,
					min: 1,
					max: 16,
					isVisible: (opts) => ['noteoff', 'noteon', 'cc', 'program', 'pitch'].includes(String(opts.msgType)),
				},
				{
					id: 'note',
					type: 'number',
					label: 'Note Number',
					default: 60,
					min: 0,
					max: 127,
					isVisible: (opts) => ['noteoff', 'noteon'].includes(String(opts.msgType)),
				},
				{
					id: 'velocity',
					type: 'number',
					label: 'Velocity',
					default: 127,
					min: 0,
					max: 127,
					isVisible: (opts) => ['noteoff', 'noteon'].includes(String(opts.msgType)) && !opts.useVariables,
				},
				{
					id: 'controller',
					type: 'number',
					label: 'Controller',
					default: 127,
					min: 0,
					max: 127,
					isVisible: (opts) => opts.msgType == 'cc',
				},
				{
					id: 'value',
					type: 'number',
					label: 'Value',
					default: 0,
					min: 0,
					max: 127,
					isVisible: (opts) => opts.msgType == 'cc' && !opts.useVariables,
				},
				{
					id: 'pitch',
					type: 'number',
					label: 'Value',
					default: 8192,
					min: 0,
					max: 16383,
					isVisible: (opts) => opts.msgType == 'pitch' && !opts.useVariables,
				},
				{
					id: 'number',
					type: 'number',
					label: 'Program Number',
					default: 1,
					min: 1,
					max: 128,
					isVisible: (opts) => opts.msgType == 'program' && !opts.useVariables,
				},
				{
					id: 'message',
					type: 'textinput',
					label: 'Message',
					default: '',
					useVariables: true,
					isVisible: (opts) => opts.msgType == 'sysex',
				},
				{
					id: 'varValue',
					type: 'textinput',
					label: 'Value',
					default: '',
					useVariables: true,
					isVisible: (opts) => opts.msgType !== 'sysex' && !!opts.useVariables,
				},
				{
					id: 'useVariables',
					type: 'checkbox',
					label: 'Use Variables',
					default: false,
					isVisible: (opts) => opts.msgType !== 'sysex',
				},
			],

			callback: async (event, context): Promise<boolean> => {
				const opts = JSON.parse(JSON.stringify(event.options))
				if (opts.channel !== undefined) opts.channel--
				let midiStr: string

				switch (String(opts.msgType)) {
					case 'noteoff':
					case 'noteon':
						opts.velocity = opts.useVariables ? await context.parseVariablesInString(opts.varValue) : opts.velocity
						break
					case 'cc':
						opts.value = opts.useVariables ? await context.parseVariablesInString(opts.varValue) : opts.value
						break
					case 'program':
						opts.number = opts.useVariables ? await context.parseVariablesInString(opts.varValue) : opts.number
						opts.number--
						break
					case 'pitch':
						opts.value = opts.useVariables ? await context.parseVariablesInString(opts.varValue) : opts.pitch
						break
					case 'sysex':
						midiStr = await context.parseVariablesInString(opts.message)
						opts.bytes = midiStr.split(/[ ,]+/).map((n: string): number => {
							return parseInt(n)
						})
				}
				const data: number[] = midi.parseMessage(String(opts.msgType), opts)!
				if (
					self.getFromDataStore(data) !== undefined &&
					self.getFromDataStore(data) == self.getDataFromBytes(data).val
				) {
					return true
				}
				return false
			},
		},
	})
}
