import type { ModuleInstance } from './main.js'
import { combineRgb } from '@companion-module/base'

export function UpdatePresets(self: ModuleInstance): void {
	self.setPresetDefinitions({
		midi_in: {
			type: 'button', // This must be 'button' for now
			category: 'Indicators', // This groups presets into categories in the ui. Try to create logical groups to help users find presets
			name: `MIDI Message In Indicator`, // A name for the preset. Shown to the user when they hover over it
			style: {
				text: `MIDI IN`, // You can use variables from your module here
				size: 'auto',
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
			type: 'button',
			category: 'Indicators',
			name: `MIDI Message Out Indicator`,
			style: {
				text: `MIDI OUT`,
				size: 'auto',
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
	})
}
