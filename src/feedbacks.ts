import ModuleInstance from './main.js'
import { combineRgb } from '@companion-module/base'
import type {
	CompanionFeedbackDefinition,
	CompanionFeedbackDefinitions,
	SomeCompanionFeedbackInputField,
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
			callback: async (event): Promise<boolean> => {
				const opts = JSON.parse(JSON.stringify(event.options))

				if (event.feedbackId == 'sysex') {
					const parsedSysex = String(opts[feedback.valId] ?? '')
					const bytes = parsedSysex
						.trim()
						.split(/[\s,]+/)
						.filter(Boolean)
						.map((n: string) => (/^0x/i.test(n) ? Number.parseInt(n.slice(2), 16) : Number(n)))
					if (
						bytes.some((byte: number) => !Number.isInteger(byte) || byte < 0 || byte > 255) ||
						bytes[0] !== 0xf0 ||
						bytes.at(-1) !== 0xf7
					)
						return false
					opts.bytes = bytes
				}

				const msg = MidiMessage.parseMessage(undefined, { id: event.feedbackId, ...opts })
				if (!msg) return false

				const dataStoreVal = self.getFromDataStore(msg)
				if (event.feedbackId !== 'sysex' && opts.createVar && self.config.autoCreateVars && msg !== undefined)
					FBCreatesVar(self, msg, dataStoreVal)
				if (dataStoreVal == undefined) return false
				if (dataStoreVal == self.getValFromMsg(msg).val) {
					return true
				}
				return false
			},
		}

		if (feedback.id != 'sysex' && self.config.autoCreateVars) {
			const valueOption = newFeedback.options.at(-1)
			if (valueOption) valueOption.isVisibleExpression = '!$(options:createVar)'
			newFeedback.options.push({
				id: 'createVar',
				type: 'checkbox',
				label: 'Auto-Create Variable',
				default: false,
				disableAutoExpression: true,
			})
		}

		feedbacks[feedback.id] = newFeedback

		if (feedback.id !== 'sysex') {
			feedbacks[feedback.id + '_value'] = {
				name: feedback.label + ' Value',
				description: feedback.desc,
				type: 'value',
				options: newFeedback.options.filter((o) => o.id !== feedback.valId && o.id !== 'createVar'),
				callback: async (event): Promise<number> => {
					const opts = JSON.parse(JSON.stringify(event.options))
					const msgId = event.feedbackId.replace('_value', '')
					const msg = MidiMessage.parseMessage(undefined, { id: msgId, ...opts })
					if (!msg) return undefined as unknown as number
					const value = self.getFromDataStore(msg)
					if (value === undefined) return undefined as unknown as number
					return msgId === 'program' ? value + 1 : value
				},
			}
		}
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
