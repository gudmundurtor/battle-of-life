import type { ActionResult } from '@jones/shared'
import type { Translations } from './types'

/**
 * Translate an engine ActionResult into a localized status message.
 *
 * The engine returns a stable, language-agnostic `code` (plus optional
 * `codeParams`) for every outcome. We map that here so the UI never leaks the
 * engine's internal Icelandic `messages`. Falls back to the Icelandic message
 * (and finally a generic error) if a code is missing or unknown.
 */
export function translateActionResult(result: ActionResult, t: Translations): string | null {
  const { code, codeParams } = result
  const m = t.actionMsg

  switch (code) {
    case 'notYourTurn': return m.notYourTurn
    case 'locationNotFound': return m.locationNotFound
    case 'actionUnavailable': return m.actionUnavailable
    case 'notEnoughTime': return m.notEnoughTime
    case 'notEnoughMoney': return m.notEnoughMoney
    case 'notWorking': return m.notWorking
    case 'workplaceNotFound': return m.workplaceNotFound
    case 'hobbyNotFound': return m.hobbyNotFound
    case 'dishNotFound': return m.dishNotFound
    case 'unknownAction': return m.unknownAction
    case 'socialized': return m.socialized
    case 'rested': return m.rested
    case 'exercised': return m.exercised
    case 'boughtClothes': return m.boughtClothes
    case 'boughtFood': return m.boughtFood
    case 'upgradedHousing': return m.upgradedHousing
    case 'groupSession': return m.groupSession
    case 'formedGroup': return m.formedGroup
    case 'joinedGroup': return m.joinedGroup
    case 'worked': {
      const jobId = String(codeParams?.jobId ?? '')
      return m.worked(t.jobs[jobId]?.title ?? jobId)
    }
    case 'studied':
      return m.studied(Number(codeParams?.amount ?? 0))
    case 'practiced': {
      const hobbyId = String(codeParams?.hobbyId ?? '')
      return m.practiced(t.hobbies[hobbyId]?.name ?? hobbyId)
    }
    case 'boughtMeal': {
      const dishId = String(codeParams?.dishId ?? '')
      return m.boughtMeal(t.dishes[dishId]?.name ?? dishId)
    }
    default:
      // Unknown / no code: prefer the engine message, else a generic error.
      return result.messages[0] ?? (result.success ? null : m.error)
  }
}
