import { CompanionVariableDefinitions, JsonObject } from '@companion-module/base'
import ModuleInstance from './main.js'
import { IMsgArgs, MidiMessage } from './midi/msgtypes.js'

export type midiVars = {
	midiIn: boolean
	midiOut: boolean
	lastMessage: string
	smpte: string
	smpteFR: number
}

const variables: CompanionVariableDefinitions<JsonObject> = {
	midiIn: { name: 'Is a MIDI Message Incoming?' },
	midiOut: { name: 'Is a MIDI Message Outgoing?' },
	lastMessage: { name: 'Last Message Received' },
	smpte: { name: 'SMPTE TC from MTC' },
	smpteFR: { name: 'SMPTE Frame Rate from MTC' },
}

const midiTimers: Map<string, ReturnType<typeof setTimeout> | null> = new Map()

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions(variables)
	self.setVariableValues({ midiIn: false, midiOut: false })
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

function CreateVarName(msg: MidiMessage): { name: string; keys: string[] } {
	// Auto-create a variable name

	let varName = msg.id
	const msgKeys = Object.keys(msg.args)
	for (let i = 0; i < msgKeys.length - 1; i++) {
		const key = msgKeys[i] as keyof IMsgArgs
		const val: number | undefined = Number(msg.args[key])
		if (val !== undefined) {
			varName += `_${val}`
		}
	}
	return { name: varName, keys: msgKeys }
}

function AddOrUpdateVar(
	self: ModuleInstance,
	varName: string,
	varDescr: string,
	data: number | string | undefined,
): void {
	variables[varName] = { name: varDescr } // if Variable doesn't exist, add it
	self.setVariableDefinitions(variables)
	self.setVariableValues({ [varName]: data })
}
