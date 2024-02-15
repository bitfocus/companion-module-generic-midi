import type { ModuleInstance } from './main.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'smpte', name: 'SMPTE TC from MTC' },
		{ variableId: 'frameRate', name: 'SMPTE Frame Rate from MTC' },
	])
}
