import type { ModuleInstance } from './main.js'
import { CompanionActionDefinition, CompanionActionDefinitions } from '@companion-module/base'
import { HandleMidiIndicators } from './variables.js'
import { MidiMessage } from './midi/msgtypes.js'
import { midiMsgTypes, createOptions } from './operations.js'

export function UpdateActions(self: ModuleInstance): void {

	self.setVariableValues({ midiOutData: false })

	const actions: CompanionActionDefinitions = {}
	for (const action of midiMsgTypes) {
		const newAction: CompanionActionDefinition = {
			name: String(action.label),
			options: createOptions([], action),
			callback: async (event, context): Promise<void> => {
				const opts = JSON.parse(JSON.stringify(event.options))
				
				if (!self.config.outPortIsVirtual && !self.midiOutput.isPortOpen()) {
					self.log('error', `Output Port "${self.midiOutput.name}" not open!`)
					return
				}

				if (action.id == 'sysex') {
					var parsedSysex = await context.parseVariablesInString(opts[action.valId])
					opts.bytes = parsedSysex.split(/[ ,]+/).map((n: string): number => parseInt(n))
				}

				if (opts.useVariables || opts.relValue) {
					opts[action.valId] = Number(await context.parseVariablesInString(opts.varValue))
					if (opts.chValue) opts.channel = Number(await context.parseVariablesInString(opts.chValue))
					if (opts.noteValue) opts.note = Number(await context.parseVariablesInString(opts.noteValue))
					if (opts.ccValue) opts.controller = Number(await context.parseVariablesInString(opts.ccValue))
				}

				let msg = MidiMessage.parseMessage(undefined, { id: action.id, ...opts })
				if (opts.relValue) {
					const val = self.getFromDataStore(msg!)
					if (val === undefined) {
						self.log('info', 'Relative value not sent. Current value from device is needed!')
						return
					}
					opts[action.valId] = val + Number(opts[action.valId] * 1)
				}

				msg = MidiMessage.parseMessage(undefined, { id: action.id, ...opts })
				self.log('debug', `Sending:  ${msg} to "${self.midiOutput.name}"`)
				self.midiOutput.send(msg!)
				HandleMidiIndicators(self, 'midiOut')
			},
		}

		if (action.id != 'sysex') {
			newAction.options.push(
				{
					id: 'relText',
					type: 'static-text',
					label: '** NOTE **',
					value: 'Relative will only work after a value has been sent from the device!',
					isVisible: (opts) => !!opts.relValue,
				},
				{
					id: 'relValue',
					type: 'checkbox',
					label: 'Relative',
					default: false,
				}
			)
		}

		actions[action.id] = newAction

	}

	self.setActionDefinitions(actions)
}
