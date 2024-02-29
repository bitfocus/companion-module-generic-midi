import { CompanionVariableDefinition } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { IMsgArgs, MidiMessage } from './midi/msgtypes.js'

const variables: CompanionVariableDefinition[] = [
	{ variableId: 'midiInData', name: 'MIDI Data Incoming' },
	{ variableId: 'midiOutData', name: 'MIDI Data Outgoing' },
	{ variableId: 'smpte', name: 'SMPTE TC from MTC' },
	{ variableId: 'smpteFR', name: 'SMPTE Frame Rate from MTC' },
]
const midiTimers: Map<string, NodeJS.Timeout | null> = new Map()

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions(variables)
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

export function FBCreatesVar(self: ModuleInstance, msg: MidiMessage, data: number | undefined): void {
	// Auto-create a variable

	let varName = `_${msg.id}`
	const keys = Object.keys(msg.args)
	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i] as keyof IMsgArgs
		let val: number | undefined = Number(msg.args[key])
		if (val !== undefined) {
			if (key == 'channel') val++
			varName += `_${val}`
		}
	}

	// Add new Auto-created variable and value
	const varToAdd = { variableId: varName, name: 'Auto-Created Variable' }
	const curVarVal = self.getVariableValue(varName)
	if (curVarVal === undefined) variables.push(varToAdd) // if Variable doesn't exist, add it
	self.setVariableDefinitions(variables)
	self.setVariableValues({ [varName]: data })
}
