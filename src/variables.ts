import type { ModuleInstance } from './main.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'midiInData', name: 'MIDI Data Incoming' },
		{ variableId : 'midiOutData', name: 'MIDI Data Outgoing'},
		{ variableId: 'smpte', name: 'SMPTE TC from MTC' },
		{ variableId: 'smpteFR', name: 'SMPTE Frame Rate from MTC' },
	])
}
