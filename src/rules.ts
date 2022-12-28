import { Rule } from './extension/types'
import { pxToRem } from './rules/pxToRem'
import { remToPx } from './rules/remToPx'
import { pxToSpacing } from './rules/pxToSpacing'
import { remToSpacing } from './rules/remToSpacing'
import { spacingInfo } from './rules/spacingInfo'
import { handleFontSize } from './rules/handleFontSize'

export const RULES: Rule[] = []

export function initRules() {
  RULES.push(
    pxToRem(),
    remToPx(),
    pxToSpacing(),
    remToSpacing(),
    handleFontSize(),
    spacingInfo()
  )
}
