export interface MscMessage {
	deviceId: number
	commandFormat: number
	command: number
	data: number[]
}

export const MSC_FORMATS = [
	{ id: 0x01, label: 'Lighting (General)' },
	{ id: 0x02, label: 'Moving Lights' },
	{ id: 0x03, label: 'Colour Changers' },
	{ id: 0x04, label: 'Strobes' },
	{ id: 0x05, label: 'Lasers' },
	{ id: 0x06, label: 'Chasers' },
	{ id: 0x10, label: 'Sound (General)' },
	{ id: 0x11, label: 'Music' },
	{ id: 0x12, label: 'CD Players' },
	{ id: 0x13, label: 'EPROM Playback' },
	{ id: 0x14, label: 'Audio Tape Machines' },
	{ id: 0x15, label: 'Intercoms' },
	{ id: 0x16, label: 'Amplifiers' },
	{ id: 0x17, label: 'Audio Effects Devices' },
	{ id: 0x18, label: 'Equalisers' },
	{ id: 0x20, label: 'Machinery (General)' },
	{ id: 0x21, label: 'Rigging' },
	{ id: 0x22, label: 'Flys' },
	{ id: 0x23, label: 'Lifts' },
	{ id: 0x24, label: 'Turntables' },
	{ id: 0x25, label: 'Trusses' },
	{ id: 0x26, label: 'Robots' },
	{ id: 0x27, label: 'Animation' },
	{ id: 0x28, label: 'Floats' },
	{ id: 0x29, label: 'Breakaways' },
	{ id: 0x2a, label: 'Barges' },
	{ id: 0x30, label: 'Video (General)' },
	{ id: 0x31, label: 'Video Tape Machines' },
	{ id: 0x32, label: 'Video Cassette Machines' },
	{ id: 0x33, label: 'Video Disc Players' },
	{ id: 0x34, label: 'Video Switchers' },
	{ id: 0x35, label: 'Video Effects' },
	{ id: 0x36, label: 'Video Character Generators' },
	{ id: 0x37, label: 'Video Still Stores' },
	{ id: 0x38, label: 'Video Monitors' },
	{ id: 0x40, label: 'Projection (General)' },
	{ id: 0x41, label: 'Film Projectors' },
	{ id: 0x42, label: 'Slide Projectors' },
	{ id: 0x43, label: 'Video Projectors' },
	{ id: 0x44, label: 'Dissolvers' },
	{ id: 0x45, label: 'Shutter Controls' },
	{ id: 0x50, label: 'Process Control (General)' },
	{ id: 0x51, label: 'Hydraulic Oil' },
	{ id: 0x52, label: 'Water' },
	{ id: 0x53, label: 'CO2' },
	{ id: 0x54, label: 'Compressed Air' },
	{ id: 0x55, label: 'Natural Gas' },
	{ id: 0x56, label: 'Fog' },
	{ id: 0x57, label: 'Smoke' },
	{ id: 0x58, label: 'Cracked Haze' },
	{ id: 0x60, label: 'Pyro (General)' },
	{ id: 0x61, label: 'Fireworks' },
	{ id: 0x62, label: 'Explosions' },
	{ id: 0x63, label: 'Flame' },
	{ id: 0x64, label: 'Smoke Pots' },
	{ id: 0x7f, label: 'All Types' },
]

export const MSC_COMMANDS = [
	{ id: 0x01, label: 'GO' },
	{ id: 0x02, label: 'STOP' },
	{ id: 0x03, label: 'RESUME' },
	{ id: 0x04, label: 'TIMED GO' },
	{ id: 0x05, label: 'LOAD' },
	{ id: 0x06, label: 'SET' },
	{ id: 0x07, label: 'FIRE' },
	{ id: 0x08, label: 'ALL OFF' },
	{ id: 0x09, label: 'RESTORE' },
	{ id: 0x0a, label: 'RESET' },
	{ id: 0x0b, label: 'GO OFF' },
	{ id: 0x10, label: 'GO / JAM CLOCK' },
	{ id: 0x11, label: 'STANDBY +' },
	{ id: 0x12, label: 'STANDBY -' },
	{ id: 0x13, label: 'SEQUENCE +' },
	{ id: 0x14, label: 'SEQUENCE -' },
	{ id: 0x15, label: 'START CLOCK' },
	{ id: 0x16, label: 'STOP CLOCK' },
	{ id: 0x17, label: 'ZERO CLOCK' },
	{ id: 0x18, label: 'SET CLOCK' },
	{ id: 0x19, label: 'MTC CHASE ON' },
	{ id: 0x1a, label: 'MTC CHASE OFF' },
	{ id: 0x1b, label: 'OPEN CUE LIST' },
	{ id: 0x1c, label: 'CLOSE CUE LIST' },
	{ id: 0x1d, label: 'OPEN CUE PATH' },
	{ id: 0x1e, label: 'CLOSE CUE PATH' },
]

export function formatMscLogMessage(message: MscMessage): string {
	const formatLabel = MSC_FORMATS.find((format) => format.id === message.commandFormat)?.label ?? 'Unknown'
	const commandLabel = MSC_COMMANDS.find((command) => command.id === message.command)?.label ?? 'Unknown'
	const hex = (value: number): string => `0x${value.toString(16).padStart(2, '0')}`
	const data = message.data.length ? `, data: ${formatMscData(message.data)}` : ''
	return `msc Message, device: ${message.deviceId} (${hex(message.deviceId)}), format: ${formatLabel} (${hex(message.commandFormat)}), command: ${commandLabel} (${hex(message.command)})${data}`
}

export function parseMsc(bytes: number[]): MscMessage | undefined {
	if (bytes.length < 7 || bytes[0] !== 0xf0 || bytes[1] !== 0x7f || bytes[3] !== 0x02 || bytes.at(-1) !== 0xf7)
		return undefined
	const payload = bytes.slice(2, -1)
	if (payload.some((b) => !Number.isInteger(b) || b < 0 || b > 0x7f)) return undefined
	return { deviceId: bytes[2], commandFormat: bytes[4], command: bytes[5], data: bytes.slice(6, -1) }
}

export function encodeMsc(
	deviceId: number,
	commandFormat: number,
	command: number,
	data: number[],
): number[] | undefined {
	if (![deviceId, commandFormat, command].every((n) => Number.isInteger(n) && n >= 0 && n <= 0x7f)) return undefined
	// Format 0 and command 0 are reserved for MSC extension levels, so leave them
	// available for callers to provide extension bytes in the data field.
	if (data.length + 7 > 128) return undefined
	if (data.some((b) => !Number.isInteger(b) || b < 0 || b > 0x7f)) return undefined
	return [0xf0, 0x7f, deviceId, 0x02, commandFormat, command, ...data, 0xf7]
}

export function parseMscData(input: string): number[] | undefined {
	const text = input.trim()
	if (!text) return []
	const values = text.split(/[\s,]+/)
	const isHex = values.every((v) => /^(?:0x)?[0-9a-f]{1,2}$/i.test(v)) && values.some((v) => /^0x/i.test(v))
	if (isHex) return values.map((v) => Number.parseInt(v.replace(/^0x/i, ''), 16))
	// A vertical bar separates MSC fields (cue, cue list, cue path), encoded with the required NUL delimiter.
	return text.split('|').flatMap((part, index, all) => {
		const bytes = Array.from(part, (char) => char.charCodeAt(0))
		return index < all.length - 1 ? [...bytes, 0] : bytes
	})
}

export function formatMscData(data: number[]): string {
	return data
		.map((b) => (b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : `0x${b.toString(16).padStart(2, '0')}`))
		.join(' ')
}
