import type { ModuleInstance } from './main.js'
import { DropdownChoice } from '@companion-module/base'
import * as easymidi from '../node-easymidi/index.js'

export function UpdateActions(self: ModuleInstance): void {
	const midiMsgTypes: DropdownChoice[] = [
		{ id: 'noteoff', label: 'Note Off' },
		{ id: 'noteon', label: 'Note On' },
		//		{ id: 'aftertouch', 	label: 'Aftertouch' },
		{ id: 'cc', label: 'CC' },
		{ id: 'program', label: 'Program Change' },
		//		{ id: 'channelpressure', label: 'Channel Pressure' },
		{ id: 'pitch', label: 'Pitch Wheel' },
		{ id: 'sysex', label: 'SysEx' },
		//		{ id: 'mtc', label: 'MIDI Time Code' },
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

	self.setActionDefinitions({
		send_message: {
			name: 'Send MIDI Message',
			options: [
				{
					id: 'msgType',
					type: 'dropdown',
					label: 'Message Type',
					default: 'noteon',
					allowCustom: true,
					choices: midiMsgTypes,
				},
				{
					id: 'channel',
					type: 'number',
					label: 'Channel',
					default: 0,
					min: 0,
					max: 15,
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
					isVisible: (opts) => ['noteoff', 'noteon'].includes(String(opts.msgType)),
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
					isVisible: (opts) => opts.msgType == 'cc',
				},
				{
					id: 'pitch',
					type: 'number',
					label: 'Value',
					default: 8192,
					min: 0,
					max: 16386,
					isVisible: (opts) => opts.msgType == 'pitch',
				},
				{
					id: 'number',
					type: 'number',
					label: 'Program Number',
					default: 127,
					min: 0,
					max: 127,
					isVisible: (opts) => opts.msgType == 'program',
				},

				{
					id: 'message',
					type: 'textinput',
					label: 'Message',
					default: '',
					useVariables: true,
					isVisible: (opts) => opts.msgType == 'sysex',
				},
			],

			callback: async (event, context) => {
				let midiStr: string
				switch (String(event.options.msgType)) {
					case 'sysex':
						midiStr = await context.parseVariablesInString(String(event.options.message))
						event.options.bytes = midiStr.split(/[ ,]+/).map((n) => {
							return parseInt(n)
						})
						break
					case 'pitch':
						event.options.value = event.options.pitch
				}
				self.midiOutput.send('message', { bytes: easymidi.parseMessage(event.options.msgType, event.options) })
			},
		},
	})
}
