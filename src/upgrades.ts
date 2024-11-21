import type {
	CompanionStaticUpgradeScript,
	CompanionStaticUpgradeResult,
	CompanionStaticUpgradeProps,
	CompanionUpgradeContext,
} from '@companion-module/base'
import type { ModuleConfig } from './config.js'

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = [
	/*
	 * Place your upgrade scripts here
	 * Remember that once it has been added it cannot be removed!
	 */
	function (
		context: CompanionUpgradeContext<ModuleConfig>,
		props: CompanionStaticUpgradeProps<ModuleConfig>,
	): CompanionStaticUpgradeResult<ModuleConfig> {
		const changes: CompanionStaticUpgradeResult<ModuleConfig> = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}

		console.log('\nRunning Update Scripts...\n')

		for (const a of props.actions) {
			if (a.actionId == 'program') {
				console.log('Updating action\n', a)
				a.options.program = a.options.number || a.options.program
				delete a.options.number
			}
			if (!a.options.chValue) a.options.chValue = a.options.channel
			if (!a.options.noteValue) a.options.noteValue = a.options.note
			if (!a.options.ccValue) a.options.ccValue = a.options.controller

			changes.updatedActions.push(a)
			console.log('to\n', a)
		}

		for (const f of props.feedbacks) {
			if (f.feedbackId == 'receive_message') {
				console.log('Updating feedback\n', f)
				f.feedbackId = String(f.options.msgType)
				delete f.options.msgType
				switch (f.feedbackId) {
					case 'program':
						f.options.program = f.options.number
						delete f.options.number
						break
					case 'sysex':
						f.options.bytes = f.options.message
						delete f.options.message
						break
					case 'pitch':
						f.options.value = f.options.pitch
						delete f.options.pitch
				}
			}
			if (!f.options.chValue) f.options.chValue = f.options.channel
			if (!f.options.noteValue) f.options.noteValue = f.options.note
			if (!f.options.ccValue) f.options.ccValue = f.options.controller

			changes.updatedFeedbacks.push(f)
			console.log('to\n', f)
		}

		return changes
	},
]
