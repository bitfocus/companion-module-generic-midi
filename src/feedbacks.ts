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
import { formatMscData, MSC_COMMANDS, MSC_FORMATS, parseMscData } from './midi/msc.js'

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

	feedbacks['msc'] = {
		name: 'MIDI Show Control (MSC) Message',
		description:
			'True when the most recently received SysEx message matches these MSC fields. MSC does not define acknowledgements.',
		type: 'boolean',
		defaultStyle: { bgcolor: combineRgb(0, 180, 0), color: combineRgb(0, 0, 0) },
		options: [
			{ id: 'deviceId', type: 'number', label: 'Device ID (-1 = any)', default: -1, min: -1, max: 127 },
			{
				id: 'commandFormat',
				type: 'dropdown',
				label: 'Command Format',
				default: -1,
				choices: [
					{ id: -1, label: 'Any' },
					...MSC_FORMATS.map((format) => ({
						id: format.id,
						label: `${format.label} (0x${format.id.toString(16).padStart(2, '0')})`,
					})),
				],
			},
			{
				id: 'command',
				type: 'dropdown',
				label: 'Command',
				default: -1,
				choices: [
					{ id: -1, label: 'Any' },
					...MSC_COMMANDS.map((command) => ({
						id: command.id,
						label: `${command.label} (0x${command.id.toString(16).padStart(2, '0')})`,
					})),
				],
			},
			{
				id: 'data',
				type: 'textinput',
				label: 'Exact Data (optional; ASCII or hex bytes)',
				default: '',
				useVariables: true,
			},
		],
		callback: async (event): Promise<boolean> => {
			const incoming = self.lastMsc
			if (!incoming) return false
			const opts = event.options
			if (Number(opts.deviceId) !== -1 && Number(opts.deviceId) !== incoming.deviceId) return false
			if (Number(opts.commandFormat) !== -1 && Number(opts.commandFormat) !== incoming.commandFormat) return false
			if (Number(opts.command) !== -1 && Number(opts.command) !== incoming.command) return false
			if (opts.data != null && typeof opts.data !== 'string') return false
			const dataText = (opts.data ?? '').trim()
			if (dataText) {
				const expected = parseMscData(dataText)
				if (!expected || expected.length !== incoming.data.length || expected.some((b, i) => b !== incoming.data[i]))
					return false
			}
			return true
		},
	}

	feedbacks['msc_value'] = {
		name: 'MIDI Show Control (MSC) Data Value',
		description: 'Returns the data from the most recently received MSC message when it matches the filters.',
		type: 'value',
		options: [
			{ id: 'deviceId', type: 'number', label: 'Device ID (-1 = any)', default: -1, min: -1, max: 127 },
			{
				id: 'commandFormat',
				type: 'dropdown',
				label: 'Command Format',
				default: -1,
				choices: [
					{ id: -1, label: 'Any' },
					...MSC_FORMATS.map((format) => ({
						id: format.id,
						label: `${format.label} (0x${format.id.toString(16).padStart(2, '0')})`,
					})),
				],
			},
			{
				id: 'command',
				type: 'dropdown',
				label: 'Command',
				default: -1,
				choices: [
					{ id: -1, label: 'Any' },
					...MSC_COMMANDS.map((command) => ({
						id: command.id,
						label: `${command.label} (0x${command.id.toString(16).padStart(2, '0')})`,
					})),
				],
			},
		],
		callback: async (event): Promise<string> => {
			const incoming = self.lastMsc
			if (!incoming) return undefined as unknown as string
			const opts = event.options
			if (Number(opts.deviceId) !== -1 && Number(opts.deviceId) !== incoming.deviceId)
				return undefined as unknown as string
			if (Number(opts.commandFormat) !== -1 && Number(opts.commandFormat) !== incoming.commandFormat)
				return undefined as unknown as string
			if (Number(opts.command) !== -1 && Number(opts.command) !== incoming.command)
				return undefined as unknown as string
			return formatMscData(incoming.data)
		},
	}

	self.setFeedbackDefinitions(feedbacks)
}
