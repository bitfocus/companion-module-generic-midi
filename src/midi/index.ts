import * as node_midi from '@julusian/midi'
import { EventEmitter } from 'events'

const INPUT_TYPES = new Map<number, string>([
	[0x08, 'noteoff'],
	[0x09, 'noteon'],
	[0x0a, 'aftertouch'],
	[0x0b, 'cc'],
	[0x0c, 'program'],
	[0x0d, 'channelpressure'],
	[0x0e, 'pitch'],
])
const INPUT_EXTENDED_TYPES = new Map<number, string>([
	[0xf0, 'sysex'],
	[0xf1, 'mtc'],
	[0xf2, 'position'],
	[0xf3, 'select'],
	[0xf6, 'tune'],
	[0xf7, 'sysex end'],
	[0xf8, 'clock'],
	[0xfa, 'start'],
	[0xfb, 'continue'],
	[0xfc, 'stop'],
	[0xfe, 'activesense'],
	[0xff, 'reset'],
])

const OUTPUT_TYPES = new Map<string, number>()
INPUT_TYPES.forEach((val: string, key: number) => OUTPUT_TYPES.set(val, key))

const OUTPUT_EXTENDED_TYPES = new Map<string, number>()
INPUT_EXTENDED_TYPES.forEach((val: string, key: number) => OUTPUT_EXTENDED_TYPES.set(val, key))

export interface MsgArgs {
	bytes?: number[]
	channel?: number
	type?: number
	note?: number
	velocity?: number
	controller?: number
	pressure?: number
	value?: number
	number?: number
	song?: number
	_type?: string
}

/*
type Channel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15

interface NoteOff {
	status: 0x80
	channel: Channel
    note: number
	velocity: number
}
interface NoteOn {
	status: 0x90
	channel: Channel
	note: number
	velocity: number
}
interface AfterTouch {
	status: 0xa0
	channel: Channel
    note: number
	pressure: number
}
interface ControlChange {
	status: 0xb0
	channel: Channel
    controller: number
	value: number
}
interface ProgramChange {
	status: 0xc0
	channel: Channel
    number: number
}
interface ChannelPressure {
	status: 0xd0
	channel: Channel
	pressure: number
}
interface Pitch {
	status: 0xe0
	channel: Channel
	value: number
}
interface Sysex {
	status: 0xf0
	bytes: number[]
}
interface Mtc {
	status: 0xf1
	type: number
	value: number
}
interface Position {
	status: 0xf2
	value: number
}
interface SongSelect {
	status: 0xf3
	song: number
}
interface TuneRequest {
	status: 0xf6
}
interface Clock {
	status: 0xf8
}
interface Tick {
	status: 0xf9
}
interface Start {
	status: 0xfa
}
interface Continue {
	status: 0xfb
}
interface Stop {
	status: 0xfc
}
interface ActiveSense {
	status: 0xfe
}
interface Reset {
	status: 0xff
}
interface Smpte {
	smpte: string
	frameRate: number
}



interface IMidiMessage {
    bytes:          number[]
//    msgType:        NoteOff | NoteOn | AfterTouch | ControlChange | ProgramChange | ChannelPressure | Pitch | Position | Mtc | Smpte | SongSelect | Sysex
}

class MidiByte {
    private _byte:number

    constructor (byte: number) {
        this._byte = byte
    }
    
    public get byte() {
        return this._byte
    }
    public set byte(value) {
        this._byte = value
    }

    public get low() {
        return this._byte & 0x0f
    }
    public set low(value) {
        this._byte = (this._byte & 0xf0) | (value & 0x0f)
    }

    public get high() {
        return this._byte >> 4
    }
    public set high(value) {
        this._byte = (this._byte & 0x0f) | ((value & 0x0f) << 4)
    }
	
	toString = () => this.byte.toString(16)
}

class MidiMessage implements IMidiMessage {
    private _bytes: MidiByte[] = []

    constructor (bytes: number[]) {
       this._bytes = bytes.map((b) => new MidiByte(b))
    }
    public get bytes() {
        return this._bytes.map((b) => b.byte)
    }
    public set bytes(value) {
        this._bytes = value.map((b) => new MidiByte(b))
    }

    private get status() {
        return this._bytes[0].high
    }
    private set status(value) {
        this._bytes[0].high = value
    }

    private get channel() {
        return this._bytes[0].low
    }
    private set channel(value) {
        this._bytes[0].low = value
    }


    private getdata = (b: number): number => {
        return this._bytes[b].byte & 0x7f
    }
    private setdata(b: number, value: number) {
        this._bytes[1].byte = value & 0x7f
    }





 }

 */

export class Input extends EventEmitter {
	private _input
	private _smpte: number[]
	private _pendingSysex: boolean
	private _sysex: number[]
	private _inputPortNumberedNames: string[]
	public name: string

	constructor(name: string, virtual?: boolean) {
		super()
		this._input = new node_midi.Input()
		this._input.ignoreTypes(false, false, false)
		this._pendingSysex = false
		this._sysex = []
		this._smpte = []
		this.name = name
		this._inputPortNumberedNames = getInputs()

		if (virtual) {
			this._input.openVirtualPort(name)
		} else {
			const numInputs = this._input.getPortCount()
			for (let i = 0; i < numInputs; i++) {
				if (name === this._inputPortNumberedNames[i]) {
					this._input.openPort(i)
				}
			}
		}

		this._input.on('message', (deltaTime: number, bytes: number[]): void => {
			// a long sysex can be sent in multiple chunks, depending on the RtMidi buffer size
			let proceed = true
			if (this._pendingSysex && bytes.length > 0) {
				if (bytes[0] < 0x80) {
					this._sysex = this._sysex.concat(bytes)
					if (bytes[bytes.length - 1] === 0xf7) {
						const args: MsgArgs = { _type: 'sysex', bytes: this._sysex }
						this.emit('sysex', args)
						this.emit('message', args)
						this._sysex = []
						this._pendingSysex = false
					}
					proceed = false
				} else {
					// ignore invalid sysex messages
					this._sysex = []
					this._pendingSysex = false
				}
			}
			if (proceed) {
				const data = parseBytes(bytes)

				if (data.type === 'sysex' && bytes[bytes.length - 1] !== 0xf7) {
					this._sysex = [...bytes]
					this._pendingSysex = true
				} else {
					data.args._type = data.type // easy access to message type
					this.emit(data.type!, data.args)
					// also emit "message" event, to allow easy monitoring of all messages
					this.emit('message', data.args)
					if (data.type === 'mtc') {
						this.parseMtc(data.args)
					}
				}
			}
		})
	}

	close(): void {
		this._input.closePort()
	}

	isPortOpen(): boolean {
		return this._input.isPortOpen()
	}

	parseMtc(data: MsgArgs): void {
		const FRAME_RATES = [24, 25, 29.97, 30]
		if (data.type === undefined) return
		const byteNumber: number = data.type
		let value: number = data.value!
		let smpteFrameRate: number

		this._smpte[byteNumber] = value

		// Check if we have 8 complete messages. If this._smpte[0] is undefined, then we started in the middle!
		if (byteNumber === 7 && typeof this._smpte[0] === 'number') {
			const bits = []
			for (let i = 3; i >= 0; i--) {
				const bit = value & (1 << i) ? 1 : 0
				bits.push(bit)
			}
			value = bits[3]
			smpteFrameRate = FRAME_RATES[(bits[1] << 1) + bits[2]]
			this._smpte[byteNumber] = value

			const smpte = this._smpte
			const smpteFormatted =
				((smpte[7] << 4) + smpte[6]).toString().padStart(2, '0') +
				':' +
				((smpte[5] << 4) + smpte[4]).toString().padStart(2, '0') +
				':' +
				((smpte[3] << 4) + smpte[2]).toString().padStart(2, '0') +
				'.' +
				((smpte[1] << 4) + smpte[0]).toString().padStart(2, '0')

			this.emit('smpte', {
				smpte: smpteFormatted,
				smpteFR: smpteFrameRate,
			})
		}
	}
}

export class Output {
	private _output
	public name: string

	constructor(name: string, virtual?: boolean) {
		this._output = new node_midi.Output()
		this.name = name
		const outputPortNumberedNames: string[] = getOutputs()

		if (virtual) {
			this._output.openVirtualPort(name)
		} else {
			const numOutputs = this._output.getPortCount()
			for (let i = 0; i < numOutputs; i++) {
				if (name === outputPortNumberedNames[i]) {
					this._output.openPort(i)
				}
			}
		}
	}

	close(): void {
		this._output.closePort()
	}

	isPortOpen(): boolean {
		return this._output.isPortOpen()
	}

	send(type: string, args: MsgArgs): void {
		this._output.sendMessage(parseMessage(type, args)!)
	}
}

// utilities
export function getInputs(): string[] {
	const input = new node_midi.Input()
	const inputs: string[] = []
	for (let i = 0; i < input.getPortCount(); i++) {
		let counter = 0
		const portName = input.getPortName(i)
		let numberedPortName = portName
		while (inputs.includes(numberedPortName)) {
			counter++
			numberedPortName = portName + counter
		}
		inputs.push(numberedPortName)
	}
	input.closePort()
	return inputs
}

export function getOutputs(): string[] {
	const output = new node_midi.Output()
	const outputs: string[] = []
	for (let i = 0; i < output.getPortCount(); i++) {
		let counter = 0
		const portName = output.getPortName(i)
		let numberedPortName = portName
		while (outputs.includes(numberedPortName)) {
			counter++
			numberedPortName = portName + counter
		}
		outputs.push(numberedPortName)
	}
	output.closePort()
	return outputs
}

export function parseBytes(bytes: number[]): { type: string | undefined; args: MsgArgs } {
	let args: MsgArgs = {}
	let type: string | undefined = 'unknown'

	if (bytes[0] >= 0xf0) {
		type = INPUT_EXTENDED_TYPES.get(bytes[0])
	} else {
		type = INPUT_TYPES.get(bytes[0] >> 4)
		args = { channel: bytes[0] & 0xf }
	}

	switch (type) {
		case 'noteoff':
		case 'noteon':
			args.note = bytes[1]
			args.velocity = bytes[2]
			break

		case 'aftertouch':
			args.note = bytes[1]
			args.pressure = bytes[2]
			break

		case 'cc':
			args.controller = bytes[1]
			args.value = bytes[2]
			break

		case 'program':
			args.number = bytes[1]
			break

		case 'channelpressure':
			args.pressure = bytes[1]
			break

		case 'pitch':
		case 'position':
			args.value = bytes[1] + (bytes[2] << 7)
			break

		case 'sysex':
			args.bytes = bytes
			break

		case 'mtc':
			args.type = (bytes[1] >> 4) & 0x07
			args.value = bytes[1] & 0x0f
			break

		case 'select':
			args.song = bytes[1]
			break
	}

	return {
		type,
		args,
	}
}

export function parseMessage(type: string | undefined, args: MsgArgs): number[] | undefined {
	const bytes: number[] | undefined = []
	const MAX_7_BIT = 127
	const MAX_14_BIT = 16383

	if (type === 'message') {
		const parsedMsg = parseBytes(args.bytes!)
		type = parsedMsg.type
		args = parsedMsg.args
	}
	if (OUTPUT_TYPES.get(type!)) {
		args.channel = args.channel || 0
		bytes.push((OUTPUT_TYPES.get(type!)! << 4) + args.channel)
	} else if (OUTPUT_EXTENDED_TYPES.get(type!)) {
		bytes.push(OUTPUT_EXTENDED_TYPES.get(type!)! * 1) // Force it to be a number
	} else {
		throw new Error('Unknown midi message type: ' + type)
	}

	switch (type) {
		case 'noteoff':
		case 'noteon':
			bytes.push(constrain(args.note!, MAX_7_BIT))
			bytes.push(constrain(args.velocity!, MAX_7_BIT))
			break

		case 'aftertouch':
			bytes.push(constrain(args.note!, MAX_7_BIT))
			bytes.push(constrain(args.pressure!, MAX_7_BIT))
			break

		case 'cc':
			bytes.push(constrain(args.controller!, MAX_7_BIT))
			bytes.push(constrain(args.value!, MAX_7_BIT))
			break

		case 'program':
			bytes.push(constrain(args.number!, MAX_7_BIT))
			break

		case 'channelpressure':
			bytes.push(constrain(args.pressure!, MAX_7_BIT))
			break

		case 'pitch':
		case 'position':
			{
				const val = constrain(args.value!, MAX_14_BIT)
				bytes.push(val & 0x7f) // lsb
				bytes.push((val & 0x3f80) >> 7) // msb
			}
			break

		case 'sysex':
			// sysex commands should start with 0xf0 and end with 0xf7. Throw an error if it doesn't.
			if (args.bytes!.length <= 3 || args.bytes![0] !== 0xf0 || args.bytes![args.bytes!.length - 1] !== 0xf7) {
				throw new Error('SysEx commands should be an array of length > 3 that starts with 0xf0 and end with 0xf7')
			}
			args.bytes!.slice(1).forEach((arg) => bytes.push(arg)) // 0xf0 was already added at the beginning of parseMessage.
			break

		case 'mtc':
			bytes.push((args.type! << 4) + args.value!)
			break

		case 'select':
			bytes.push(constrain(args.song!, MAX_7_BIT))
			break
	}
	return bytes
}

const constrain = (num: number, max: number) => (num > max ? max : num < 0 ? 0 : num)
