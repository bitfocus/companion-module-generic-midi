import { CompanionVariableDefinition } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { IMsgArgs, MidiMessage } from './midi/msgtypes.js'

const variables: CompanionVariableDefinition[] = [
	{ variableId: 'midiIn', name: 'Is a MIDI Message Incoming?' },
	{ variableId: 'midiOut', name: 'Is a MIDI Message Outgoing?' },
	{ variableId: 'lastMessage', name: 'Last Message Received' },
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

export function UpdateLastMsg(self: ModuleInstance, msg: MidiMessage, data: number | undefined): void {
	const msgInfo = CreateVarName(msg)
	const lastMsg = msgInfo.name + '_' + data
	self.setVariableValues({ lastMessage: lastMsg })

	AddOrUpdateVar(self, 'lastMsgType', 'Last Message Type Received', msg.id)

	for (let i = 0; i < msgInfo.keys.length; i++) {
		const keyName = msgInfo.keys[i]
		const key = keyName as keyof IMsgArgs
		const CapKeyName = keyName[0].toUpperCase() + keyName.slice(1)
		AddOrUpdateVar(self, 'last' + CapKeyName, 'Last ' + CapKeyName + ' Received', Number(msg.args[key]))
	}
}

export function FBCreatesVar(self: ModuleInstance, msg: MidiMessage, data: number | undefined): void {
	// Auto-create a variable
	AddOrUpdateVar(self, '_' + CreateVarName(msg).name, 'Auto-Created Variable', data)
}

function CreateVarName(msg: MidiMessage): { name: string, keys: string[] } {
	// Auto-create a variable name

	let varName = msg.id
	const msgKeys = Object.keys(msg.args)
	for (let i = 0; i < msgKeys.length - 1; i++) {
		const key = msgKeys[i] as keyof IMsgArgs
		let val: number | undefined = Number(msg.args[key])
		if (val !== undefined) {
			varName += `_${val}`
		}
	}
	return { name: varName, keys: msgKeys }
}

function AddOrUpdateVar(self: ModuleInstance, varName: string, varDescr: string, data: number | string | undefined): void {
	const varToAdd = { variableId: varName, name: varDescr }
	const curVarVal = self.getVariableValue(varName)
	if (curVarVal === undefined) variables.push(varToAdd) // if Variable doesn't exist, add it
	self.setVariableDefinitions(variables)
	self.setVariableValues({ [varName]: data })
}
