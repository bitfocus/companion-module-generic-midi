import { FixupNumericOrVariablesValueToExpressions } from '@companion-module/base'
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
		_context: CompanionUpgradeContext<ModuleConfig>,
		props: CompanionStaticUpgradeProps<ModuleConfig, undefined>,
	): CompanionStaticUpgradeResult<ModuleConfig, undefined> {
		const changes: CompanionStaticUpgradeResult<ModuleConfig, undefined> = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}

		for (const a of props.actions) {
			let changed = false
			if (a.actionId == 'program' && a.options.number !== undefined) {
				const program = a.options.number
				if (program !== undefined && a.options.program === undefined) a.options.program = program
				delete a.options.number
				changed = true
			}
			if (changed) changes.updatedActions.push(a)
		}

		for (const f of props.feedbacks) {
			if (f.feedbackId == 'receive_message') {
				const msgType = f.options.msgType
				const rawId = msgType && !msgType.isExpression ? msgType.value : undefined
				const id = typeof rawId === 'string' || typeof rawId === 'number' ? String(rawId) : ''
				if (!id) continue
				f.feedbackId = id
				delete f.options.msgType
				let key: string | undefined
				switch (f.feedbackId) {
					case 'program':
						key = 'number'
						break
					case 'sysex':
						key = 'message'
						break
					case 'pitch':
						key = 'pitch'
						break
				}
				if (key && f.options[key] !== undefined) {
					f.options[key === 'number' ? 'program' : key === 'message' ? 'bytes' : 'value'] = f.options[key]
					delete f.options[key]
				}
				changes.updatedFeedbacks.push(f)
			}
		}

		return changes
	},

	function (
		_context: CompanionUpgradeContext<ModuleConfig>,
		props: CompanionStaticUpgradeProps<ModuleConfig, undefined>,
	): CompanionStaticUpgradeResult<ModuleConfig, undefined> {
		const changes: CompanionStaticUpgradeResult<ModuleConfig, undefined> = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}

		for (const a of props.actions) {
			if (a.actionId === 'sysex') continue
			let changed = false

			if (!a.options.sendOverTime) {
				a.options.sendOverTime = { isExpression: false, value: false }
				changed = true
			}
			if (!a.options.timeStartValue) {
				a.options.timeStartValue = { isExpression: false, value: 0 }
				changed = true
			}
			if (!a.options.time) {
				a.options.time = { isExpression: false, value: 1 }
				changed = true
			}
			if (!a.options.curve) {
				a.options.curve = { isExpression: false, value: 'linear' }
				changed = true
			}

			if (changed) changes.updatedActions.push(a)
		}

		return changes
	},
	function (
		context: CompanionUpgradeContext<ModuleConfig>,
		props: CompanionStaticUpgradeProps<ModuleConfig, undefined>,
	): CompanionStaticUpgradeResult<ModuleConfig, undefined> {
		const changes: CompanionStaticUpgradeResult<ModuleConfig, undefined> = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}
		let enableAutoCreateVars = false

		for (const action of props.actions) {
			if (action.options.useVariables?.value !== true) continue
			const valId =
				action.actionId === 'program'
					? 'program'
					: action.actionId === 'sysex'
						? 'bytes'
						: action.actionId === 'noteon' || action.actionId === 'noteoff'
							? 'velocity'
							: 'value'
			for (const [oldKey, newKey] of [
				['chValue', 'channel'],
				['noteValue', 'note'],
				['ccValue', 'controller'],
				['varValue', valId],
			]) {
				const value = action.options[oldKey]
				if (value !== undefined) action.options[newKey] = FixupNumericOrVariablesValueToExpressions(value)
				delete action.options[oldKey]
			}
			delete action.options.useVariables
			changes.updatedActions.push(action)
		}

		for (const feedback of props.feedbacks) {
			if (feedback.options.createVar?.value === true) enableAutoCreateVars = true
			if (feedback.options.useVariables?.value !== true) continue
			const valId =
				feedback.feedbackId === 'program'
					? 'program'
					: feedback.feedbackId === 'sysex'
						? 'bytes'
						: feedback.feedbackId === 'noteon' || feedback.feedbackId === 'noteoff'
							? 'velocity'
							: 'value'
			for (const [oldKey, newKey] of [
				['chValue', 'channel'],
				['noteValue', 'note'],
				['ccValue', 'controller'],
				['varValue', valId],
			]) {
				const value = feedback.options[oldKey]
				if (value !== undefined) feedback.options[newKey] = FixupNumericOrVariablesValueToExpressions(value)
				delete feedback.options[oldKey]
			}
			delete feedback.options.useVariables
			changes.updatedFeedbacks.push(feedback)
		}

		if (enableAutoCreateVars && !context.currentConfig.autoCreateVars) {
			changes.updatedConfig = { ...context.currentConfig, autoCreateVars: true }
		}
		return changes
	},
]
