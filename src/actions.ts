import type { ModuleInstance } from './main.js'

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		send_message: {
			name: 'Send Message',
			options: [
				{
					id: 'message',
					type: 'textinput',
					label: 'Message',
					default: '',
					useVariables: true,
				},
			],
			callback: async (event, context) => {
				console.log(event)
				const val = await context.parseVariablesInString('1,2,3')
				const bytes: number[] = val.split(',').map((n) => {
					return parseInt(n, 10)
				})
				self.midiOutput.send('message', bytes)
			},
		},
	})
}
