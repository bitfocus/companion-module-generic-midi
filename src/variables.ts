import type { ModuleInstance } from './main.js'

const midiTimers: Map<string, NodeJS.Timeout | null> = new Map()

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'midiInData', name: 'MIDI Data Incoming' },
		{ variableId: 'midiOutData', name: 'MIDI Data Outgoing' },
		{ variableId: 'smpte', name: 'SMPTE TC from MTC' },
		{ variableId: 'smpteFR', name: 'SMPTE Frame Rate from MTC' },
	])
}

export function HandleMidiIndicators(self: ModuleInstance, variable: string): void {
	let t = midiTimers.get(variable) ?? null
	if (t !== null) clearTimeout(t)
	t = setTimeout(() => {
		self.setVariableValues({ [variable]: false })
		self.checkFeedbacks(variable)
	}, 200)
	midiTimers.set(variable, t)
	self.setVariableValues({ [variable]: true })
	self.checkFeedbacks(variable)
}
