import type { ModuleInstance } from './main.js'
import {
	CompanionFeedbackDefinition,
	CompanionFeedbackDefinitions,
	SomeCompanionFeedbackInputField,
	combineRgb,
} from '@companion-module/base'
import { FBCreatesVar } from './variables.js'
import { MidiMessage } from './midi/msgtypes.js'
import { midiMsgTypes, createOptions } from './operations.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	const feedbacks: CompanionFeedbackDefinitions = {}
	for (const feedback of midiMsgTypes) {
		const newFeedback: CompanionFeedbackDefinition = {
			name: feedback.label,
			description: feedback.desc,
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: createOptions([], feedback) as SomeCompanionFeedbackInputField[],
			callback: async (event, context): Promise<boolean> => {
				const opts = JSON.parse(JSON.stringify(event.options))

				if (event.feedbackId == 'sysex') {
					var parsedSysex = await context.parseVariablesInString(opts[feedback.valId])
					opts.bytes = parsedSysex.split(/[ ,]+/).map((n: string): number => parseInt(n))
				}

				if (opts.useVariables || opts.relValue) {
					opts[feedback.valId] = Number(await context.parseVariablesInString(opts.varValue))
					if (opts.chValue) opts.channel = Number(await context.parseVariablesInString(opts.chValue))
					if (opts.noteValue) opts.note = Number(await context.parseVariablesInString(opts.noteValue))
					if (opts.ccValue) opts.controller = Number(await context.parseVariablesInString(opts.ccValue))
				}

				const msg = MidiMessage.parseMessage(undefined, { id: event.feedbackId, ...opts })

				const dataStoreVal = self.getFromDataStore(msg!)
				if (event.feedbackId !== 'sysex' && opts.useVariables && opts.createVar && msg !== undefined)
					FBCreatesVar(self, msg, dataStoreVal)
				if (dataStoreVal == undefined) return false
				if (dataStoreVal == self.getValFromMsg(msg!).val) {
					return true
				}
				return false
			},
		}

		if (feedback.id != 'sysex') {
			newFeedback.options.push({
				id: 'createVar',
				type: 'checkbox',
				label: 'Auto-Create Variable',
				default: false,
				isVisible: (opts) => !!opts.useVariables,
			})
		}

		feedbacks[feedback.id] = newFeedback
	}

	feedbacks['midiIn'] = {
		name: 'MIDI Message Incoming?',
		description: 'Fire whenever ANY MIDI message is received',
		type: 'boolean',
		defaultStyle: {
			bgcolor: combineRgb(255, 0, 0),
			color: combineRgb(0, 0, 0),
		},
		options: [],
		callback: async (): Promise<boolean> => {
			return !!self.getVariableValue('midiIn')
		},
	}

	feedbacks['midiOut'] = {
		name: 'MIDI Message Outgoing?',
		description: 'Fire whenever ANY MIDI message is sent',
		type: 'boolean',
		defaultStyle: {
			bgcolor: combineRgb(255, 0, 0),
			color: combineRgb(0, 0, 0),
		},
		options: [],
		callback: async (): Promise<boolean> => {
			return !!self.getVariableValue('midiOut')
		},
	}

	self.setFeedbackDefinitions(feedbacks)
}
