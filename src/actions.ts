import type { ModuleInstance } from './main.js'
import { CompanionActionDefinition, CompanionActionDefinitions } from '@companion-module/base'
import * as easymidi from '../node-easymidi/index.js'

export function UpdateActions(self: ModuleInstance): void {
	interface ActionDef {
		id: string
		name: string
		valId: string
		valLabel: string
		valMin: number
		valMax: number
	}
	const midiMsgTypes: ActionDef[] = [
		{ id: 'noteoff', 			name: 'Note Off', valId: 'velocity', valLabel: 'Velocity', valMin: 0, valMax: 127 },
		{ id: 'noteon', 			name: 'Note On', valId: 'velocity', valLabel: 'Velocity', valMin: 0, valMax: 127 },
//		{ id: 'aftertouch', 		name: 'Aftertouch' },
		{ id: 'cc', 				name: 'CC', valId: 'value', valLabel: 'Value', valMin: 0, valMax: 127 },
		{ id: 'program', 			name: 'Program Change', valId: 'number', valLabel: 'Program Number', valMin: 1, valMax: 128 },
//		{ id: 'channelpressure', 	name: 'Channel Pressure' },
		{ id: 'pitch', 				name: 'Pitch Wheel', valId: 'value', valLabel: 'Value', valMin: 0, valMax: 16383 },
		{ id: 'sysex', 				name: 'SysEx', valId: 'bytes', valLabel: 'SysEx Bytes', valMin: 0, valMax: 127 },
//		{ id: 'mtc', 				name: 'MIDI Time Code' },
//		{ id: 'position',			name: 'Song Position Pointer' },
//		{ id: 'select',				name: 'Song Select' },
//		{ id: 'tune',				name: 'Tune Request' },
//		{ id: 'sysex end',			name: 'SysEx End' },
//		{ id: 'clock',				name: 'Clock' },
//		{ id: 'start',				name: 'Start' },
//		{ id: 'continue',			name: 'Continue' },
//		{ id: 'stop',				name: 'Stop' },
//		{ id: 'activesense',		name 'Active Sensing' },
//		{ id: 'reset',				name: 'Reset' },
	]
	
	let midiOutTimer: NodeJS.Timeout
	self.setVariableValues({midiOutData: false})

	const actions: CompanionActionDefinitions = {}
	for (let action of midiMsgTypes) {
		let newAction: CompanionActionDefinition = {
			name: String(action.name),
			options: [],
			callback: async (event, context) => {
				if (!self.midiOutput.isPortOpen()) {
					self.log('error', `Output Port ${self.midiOutput.name} not open!`)
					return
				}
				let opts = JSON.parse(JSON.stringify(event.options))

				if (action.id == 'sysex') {
					opts.bytes = opts[action.valId].split(/[ ,]+/).map((n: string): number => {
						return parseInt(n)
					})
				}
				if (opts.useVariables || opts.relValue) {
					opts[action.valId] = await context.parseVariablesInString(opts.varValue)
				}
				opts.channel--
				let data: number[] = easymidi.parseMessage(action.id, opts)
				if (opts.relValue) {
					let val = self.getFromDataStore(data)
					if (val === undefined) {
						self.log('info', 'Relative value not sent. Current value from device is missing!')
						return
					} 
					opts[action.valId] = val + Number(opts[action.valId] * 1)
				} else {
					opts.number--
				}
				data = easymidi.parseMessage(action.id, opts)
				self.log('debug', `Sending:  ${JSON.stringify(easymidi.parseBytes(data))} to ${self.midiOutput.name}`)
				
				self.midiOutput.send('message', { bytes: data })

				clearTimeout(midiOutTimer)
				midiOutTimer = setTimeout(() => {
					self.setVariableValues({midiOutData: false})		
				}, 200)			
				self.setVariableValues({midiOutData: true})
			},
		}
		if (['noteoff', 'noteon', 'cc', 'program', 'pitch'].includes(action.id)) {
			newAction.options.push(
			{
				id: 'channel',
				type: 'number',
				label: 'Channel',
				default: 1,
				min: 1,
				max: 16,
			})
		}
		if (['noteoff', 'noteon'].includes(action.id)) {
			newAction.options.push(
			{
				id: 'note',
				type: 'number',
				label: 'Note Number',
				default: 60,
				min: 0,
				max: 127,
			})
		}
		if (action.id == 'cc') {
			newAction.options.push(
			{
				id: 'controller',
				type: 'number',
				label: 'Controller',
				default: 127,
				min: 0,
				max: 127,
			})
		}
		if (action.id != 'sysex') {
			newAction.options.push(
			{
				id: action.valId,
				type: 'number',
				label: action.valLabel,
				default: action.valMin,
				min: action.valMin,
				max: action.valMax,
				isVisible: (opts) => !opts.useVariables && !opts.relValue
			},
			{
				id: 'varValue',
				type: 'textinput',
				label: action.valLabel,
				default: '',
				useVariables: true,
				isVisible: (opts) => !!opts.useVariables || !!opts.relValue
			},
			{
				id: 'useVariables',
				type: 'checkbox',
				label: 'Use Variables',
				default: false,
			},
			{
				id: 'relValue',
				type: 'checkbox',
				label: 'Relative',
				default: false,
			})
		} else {
			newAction.options.push(
			{
				id: 'bytes',
				type: 'textinput',
				label: action.valLabel,
				tooltip: 'Enter a string of decimal or hex digits, with spaces or commas between. MUST start with 0xF0 and end with 0xF7',
				default: '',
				useVariables: true,
			})
		}
		actions[String(action.id)] = newAction
	}

	self.setActionDefinitions(actions)

}
