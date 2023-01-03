import { Rule } from './extension/types'
import { handleValues } from './rules/handleValues'
import { handleSpacing } from './rules/handleSpacing'
import { handleFontSize } from './rules/handleFontSize'
import { handleLineHeight } from './rules/handleLineHeight'

export const RULES: Rule[] = []

export function initRules() {
  RULES.push(
    handleValues(),
    handleSpacing(),
    handleFontSize(),
    handleLineHeight()
  )
}
