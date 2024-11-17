const MAX_7_BIT = 0x7f
const MAX_14_BIT = 0x3fff

const MIDI_STATUS_TYPES = new Map<string, number>([
	['noteoff', 0x80],
	['noteon', 0x90],
	['aftertouch', 0xa0],
	['cc', 0xb0],
	['program', 0xc0],
	['channelpressure', 0xd0],
	['pitch', 0xe0],
	['sysex', 0xf0],
	['mtc', 0xf1],
	['position', 0xf2],
	['select', 0xf3],
	['tune', 0xf6],
	['sysex end', 0xf7],
	['clock', 0xf8],
	['start', 0xfa],
	['continue', 0xfb],
	['stop', 0xfc],
	['activesense', 0xfe],
	['reset', 0xff],
])

const hex = (val: number) => `${val} (0x${val.toString(16).padStart(2, '0')})`

export interface IMsgArgs {
	id?: string
	bytes?: number[]
	status?: number
	channel?: number
	type?: number
	note?: number
	velocity?: number
	controller?: number
	pressure?: number
	value?: number
	program?: number
	song?: number
}

export class MidiMessage {
	id = ''
	bytes: number[]
	static noMsg: IMsgArgs = {
		bytes: [],
		status: 0,
		channel: 0,
		type: 0,
		note: 0,
		velocity: 0,
		controller: 0,
		pressure: 0,
		value: 0,
		program: 0,
		song: 0,
	}

	constructor(bytes: number[] = []) {
		this.bytes = bytes
	}

	get status(): number {
		return this.bytes[0] > 0xef ? this.bytes[0] : this.bytes[0] & 0xf0
	}
	set status(v: number) {
		this.bytes[0] = v > 0xef ? v : (this.bytes[0] & 0x0f) | (v & 0xf0)
	}

	get channel(): number {
		return (this.bytes[0] & 0x0f) + 1
	}
	set channel(v: number) {
		v-- 	// Channels are normally shown as 1-16 but internally are 0-15
		v = MidiMessage.constrain(v, 15)
		this.bytes[0] = ((this.bytes[0] & 0xf0) | (v & 0x0f))
	}

	protected get data1(): number {
		return this.bytes[1] & 0x7f
	}
	protected set data1(v: number) {
		this.bytes[1] = MidiMessage.constrain(v, MAX_7_BIT)
	}

	protected get data2(): number {
		return this.bytes[2] & 0x7f
	}
	protected set data2(v: number) {
		this.bytes[2] = MidiMessage.constrain(v, MAX_7_BIT)
	}

	get args(): IMsgArgs {
		return { bytes: this.bytes }
	}

	toString(): string {
		return `${this.id} Message`
	}

	static constrain(num: number, max: number): number {
		return num > max ? max : num < 0 ? 0 : num
	}

	static parseMessage(bytes: number[] = [], msg: IMsgArgs = this.noMsg): MidiMessage | undefined {
		let incoming = new MidiMessage(bytes)
		let status = bytes.length > 0 ? incoming.status : msg.status || 0
		if (status === 0 && typeof msg.id !== undefined) status = MIDI_STATUS_TYPES.get(msg.id!) || 0

		switch (status) {
			case 0x80:
				incoming = new NoteOff(msg.channel!, msg.note!, msg.velocity!)
				break
			case 0x90:
				incoming = new NoteOn(msg.channel!, msg.note!, msg.velocity!)
				break
			case 0xa0:
				incoming = new Aftertouch(msg.channel!, msg.note!, msg.pressure!)
				break
			case 0xb0:
				incoming = new ControlChange(msg.channel!, msg.controller!, msg.value!)
				break
			case 0xc0:
				incoming = new ProgramChange(msg.channel!, msg.program!)
				break
			case 0xd0:
				incoming = new ChannelPressure(msg.channel!, msg.pressure!)
				break
			case 0xe0:
				incoming = new PitchWheel(msg.channel!, msg.value!)
				break
			case 0xf0:
				incoming = new Sysex(msg.bytes!)
				break
			case 0xf1:
				incoming = new Mtc(msg.type!, msg.value!)
				break
			case 0xf8:
				return // ignore MIDI Clock messages
			default:
				console.log(`Unsupported MIDI message. Status = ${hex(status)}`)
				return
		}

		if (bytes.length > 0) incoming.bytes = bytes // push the data to this message
		return incoming
	}
}

class NoteOff extends MidiMessage {
	constructor(c: number, n: number, v: number) {
		super()
		this.id = 'noteoff'
		this.status = 0x80
		this.channel = c
		this.note = n
		this.velocity = v
	}

	get note() {
		return this.data1
	}
	set note(v: number) {
		this.data1 = v
	}

	get velocity() {
		return this.data2
	}
	set velocity(v: number) {
		this.data2 = v
	}

	get args(): IMsgArgs {
		return { channel: this.channel, note: this.note, velocity: this.velocity }
	}

	toString(): string {
		return `${super.toString()}, channel: ${hex(this.channel)}, note: ${hex(this.note)}, velocity: ${hex(
			this.velocity
		)}`
	}
}

class NoteOn extends NoteOff {
	constructor(c: number, n: number, v: number) {
		super(c, n, v)
		this.id = 'noteon'
		this.status = 0x90
	}
}

class Aftertouch extends MidiMessage {
	constructor(c: number, n: number, p: number) {
		super()
		this.id = 'aftertouch'
		this.status = 0xa0
		this.channel = c
		this.note = n
		this.pressure = p
	}

	get note() {
		return this.data1
	}
	set note(v: number) {
		this.data1 = v
	}

	get pressure() {
		return this.data2
	}
	set pressure(v: number) {
		this.data2 = v
	}

	get args(): IMsgArgs {
		return { channel: this.channel, note: this.note, pressure: this.pressure }
	}

	toString(): string {
		return `${super.toString()}, channel: ${hex(this.channel)}, note: ${hex(this.note)}, pressure: ${hex(
			this.pressure
		)}`
	}
}

class ControlChange extends MidiMessage {
	constructor(c: number, cc: number, v: number) {
		super()
		this.id = 'cc'
		this.status = 0xb0
		this.channel = c
		this.controller = cc
		this.value = v
	}

	get controller() {
		return this.data1
	}
	set controller(v: number) {
		this.data1 = v
	}

	get value() {
		return this.data2
	}
	set value(v: number) {
		this.data2 = v
	}

	get args(): IMsgArgs {
		return { channel: this.channel, controller: this.controller, value: this.value }
	}

	toString(): string {
		return `${super.toString()}, channel: ${hex(this.channel)}, controller: ${hex(this.controller)}, value: ${hex(
			this.value
		)}`
	}
}

class ProgramChange extends MidiMessage {
	constructor(c: number, n: number) {
		super()
		this.id = 'program'
		this.status = 0xc0
		this.channel = c
		this.program = n
	}

	get program() {
		return this.data1 + 1 	// PC is normally shown as 1-128, but it's internally 0-127
	}
	set program(v: number) {
		v--
		this.data1 = v
	}

	get args(): IMsgArgs {
		return { channel: this.channel, program: this.program }
	}

	toString(): string {
		return `${super.toString()}, channel: ${hex(this.channel)}, program: ${hex(this.program)}`
	}
}

class ChannelPressure extends MidiMessage {
	constructor(c: number, p: number) {
		super()
		this.id = 'channelpressure'
		this.status = 0xd0
		this.channel = c
		this.pressure = p
	}

	get pressure() {
		return this.data1
	}
	set pressure(v: number) {
		this.data1 = v
	}

	get args(): IMsgArgs {
		return { channel: this.channel, pressure: this.pressure }
	}

	toString(): string {
		return `${super.toString()}, channel: ${hex(this.channel)}, pressure: ${hex(this.pressure)}`
	}
}

class PitchWheel extends MidiMessage {
	constructor(c: number, v: number) {
		super()
		this.id = 'pitch'
		this.status = 0xe0
		this.channel = c
		this.value = v
	}

	get value() {
		return (this.data2 << 7) + this.data1
	}
	set value(v: number) {
		v = MidiMessage.constrain(v, MAX_14_BIT)
		this.data2 = (v >> 7) & 0x7f
		this.data1 = v & 0x7f
	}

	get args(): IMsgArgs {
		return { channel: this.channel, value: this.value }
	}

	toString(): string {
		return `${super.toString()}, channel: ${hex(this.channel)}, value: ${hex(this.value)}`
	}
}

class Sysex extends MidiMessage {
	constructor(b: number[]) {
		super()
		this.id = 'sysex'
		this.bytes = b
	}

	get args(): IMsgArgs {
		return { bytes: this.bytes }
	}

	toString(): string {
		return `${super.toString()}, bytes: ${this.bytes}`
	}
}

export class Mtc extends MidiMessage {
	constructor(t: number, v: number) {
		super()
		this.id = 'mtc'
		this.status = 0xf1
		this.type = t
		this.value = v
	}

	get type(): number {
		return (this.data1 >> 4) & 0x07
	}
	set type(v: number) {
		this.data1 = (this.data1 & 0x0f) | (v << 4)
	}

	get value(): number {
		return this.data1 & 0x0f
	}
	set value(v: number) {
		v = MidiMessage.constrain(v, 15)
		this.data1 = (this.data1 & 0xf0) | v
	}

	get args(): IMsgArgs {
		return { channel: this.channel, type: this.type, value: this.value }
	}

	toString(): string {
		return `${super.toString()}, type: ${hex(this.type)}, value: ${hex(this.value)}`
	}
}
