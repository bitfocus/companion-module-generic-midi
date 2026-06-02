import ModuleInstance from './main.js'
import { combineRgb } from '@companion-module/base'

export function UpdatePresets(self: ModuleInstance): void {
	const presets = {
		midi_in: {
			type: 'simple' as const,
			name: `MIDI Message In Indicator`,
			style: {
				text: `MIDI IN`,
				size: 'auto' as const,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [],
			feedbacks: [
				{
					feedbackId: 'midiIn',
					options: {},
					style: {
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 255, 0),
					},
				},
			],
		},
		midi_out: {
			type: 'simple' as const,
			name: `MIDI Message Out Indicator`,
			style: {
				text: `MIDI OUT`,
				size: 'auto' as const,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [],
			feedbacks: [
				{
					feedbackId: 'midiOut',
					options: {},
					style: {
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 255, 0),
					},
				},
			],
		},
	}

	const structure = [
		{
			id: 'indicators',
			name: 'Indicators',
			definitions: [
				{
					id: 'midi_indicators',
					type: 'simple' as const,
					name: 'MIDI Indicators',
					presets: ['midi_in', 'midi_out'],
				},
			],
		},
	]

	self.setPresetDefinitions(structure, presets)
}
