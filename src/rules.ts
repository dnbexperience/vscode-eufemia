import type { Rule } from './extension/types'
import { handleValues } from './rules/handleValues'
import { handleSpacing } from './rules/handleSpacing'
import { handleCalc } from './rules/handleCalc'
import { handleFontSize } from './rules/handleFontSize'
import { handleLineHeight } from './rules/handleLineHeight'

export const RULES: Rule[] = []

export function initRules() {
  if (RULES.length === 0) {
    RULES.push(
      handleValues(),
      handleSpacing(),
      handleCalc(),
      handleFontSize(),
      handleLineHeight()
    )
  }
}
