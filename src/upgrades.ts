import type { CompanionStaticUpgradeScript, CompanionStaticUpgradeResult } from '@companion-module/base'
import type { ModuleConfig } from './config.js'

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = [
	/*
	 * Place your upgrade scripts here
	 * Remember that once it has been added it cannot be removed!
	 */
	 function (context, props) {
		const changes: CompanionStaticUpgradeResult<ModuleConfig> = {
			updatedConfig: null,
	 		updatedActions: [],
	 		updatedFeedbacks: [],
		}

		for (let a of props.actions) {
			if (a.actionId == 'program') {
				console.log('Updating action\n', a)
				a.options.program = a.options.number || a.options.program
				delete a.options.number
				changes.updatedActions.push(a)
				console.log('to\n', a)
			}
		}

		for (let f of props.feedbacks) {
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
				changes.updatedFeedbacks.push(f)
				console.log('to\n', f)
			}
		}

	 	return changes
	},
]
