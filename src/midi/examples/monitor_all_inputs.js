/*
const easymidi = require('../index.js')

// Monitor all MIDI inputs with a single "message" listener
easymidi.getInputs().forEach((inputName) => {
	const input = new easymidi.Input(inputName)
	input.on('message', (args) => {
		const vals = Object.keys(args).map((key) => `${key}: ${args[key]}`)
		console.log(`${inputName}: ${vals.join(', ')}`)
	})
})
*/
