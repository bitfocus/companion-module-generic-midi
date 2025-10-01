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
					const parsedSysex = await context.parseVariablesInString(opts[action.valId])
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

				if (opts.sendOverTime) {
					// Handle sending over time
					const durationMs = opts.time * 1000
					const curve = opts.curve
					const tickMs = 15

					let start = 0
					if (opts.relValue) {
						start = self.getFromDataStore(msg!) || 0
					} else {
						start = Number(opts.timeStartValue)
					}

					let end = Number(opts[action.valId] * 1)

					//ensure end value is within bounds
					if (end < 0) {
						end = 0
					} else if (end > 127) {
						end = 127
					}

					//if start > end, swap them
					if (start > end) {
						//;[start, end] = [end, start]
					}

					const t0 = Date.now()
					let last = -1

					interface EaseFunctions {
						[key: string]: (x: number) => number
					}

					const easeFunctions: EaseFunctions = {
						linear: (x: number): number => x,
						easeIn: (x: number): number => x * x,
						easeOut: (x: number): number => 1 - (1 - x) * (1 - x),
						easeInOut: (x: number): number => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
					}
					const ease: (x: number) => number = easeFunctions[curve as string] || ((x: number): number => x)

					const timer = setInterval(() => {
						const elapsed = Date.now() - t0
						const u = Math.min(1, elapsed / durationMs)
						const val = Math.round(start + (end - start) * ease(u))

						if (val !== last) {
							opts[action.valId] = val
							msg = MidiMessage.parseMessage(undefined, { id: action.id, ...opts })
							self.log('debug', `Sending:  ${msg} to "${self.midiOutput.name}"`)
							self.midiOutput.send(msg!)
							HandleMidiIndicators(self, 'midiOut')
							last = val
						}
						if (u >= 1) clearInterval(timer)
					}, tickMs)
				} else {
					msg = MidiMessage.parseMessage(undefined, { id: action.id, ...opts })
					self.log('debug', `Sending:  ${msg} to "${self.midiOutput.name}"`)
					self.midiOutput.send(msg!)
					HandleMidiIndicators(self, 'midiOut')
				}
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
				},
			)

			//over time features - time in seconds, curve type (linear, ease in, ease out, ease in/out)
			newAction.options.push(
				{
					id: 'sendOverTime',
					type: 'checkbox',
					label: 'Send Over Time',
					default: false,
				},
				{
					id: 'timeStartValue',
					type: 'number',
					label: 'Start Value',
					default: 0,
					min: 0,
					max: 127,
					isVisible: (opts) => !!opts.sendOverTime && !opts.relValue,
				},
				{
					id: 'time',
					type: 'number',
					label: 'Time (seconds)',
					default: 1,
					min: 0,
					max: 600,
					isVisible: (opts) => !!opts.sendOverTime,
				},
				{
					id: 'curve',
					type: 'dropdown',
					label: 'Curve Type',
					default: 'linear',
					choices: [
						{ label: 'Linear', id: 'linear' },
						{ label: 'Ease In', id: 'easeIn' },
						{ label: 'Ease Out', id: 'easeOut' },
						{ label: 'Ease In/Out', id: 'easeInOut' },
					],
					isVisible: (opts) => !!opts.sendOverTime,
				},
			)
		}

		actions[action.id] = newAction
	}

	self.setActionDefinitions(actions)
}
