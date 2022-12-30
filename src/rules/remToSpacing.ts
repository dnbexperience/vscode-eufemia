import { calc } from '@dnb/eufemia/components/space/SpacingUtils'
import { conf, isSpacing, localize } from '../extension/helpers'
import { Rule } from '../extension/types'

export const remToSpacing = (): Rule => {
  return {
    type: 'remToSpacing',
    convert: {
      allTest: /([-]?[\d.]+)rem/g,
      singleTest: /([-]?[\d.]+)r(e|em)?$/,
      convertCondition: (line) => isSpacing(line),
      convertHandler: (text) => {
        const px = parseFloat(text)
        const resultValue = +(px * conf.rootFontSize).toFixed(
          conf.fixedDigits
        )
        const value = calc(px + 'px')
        const label = `${px}rem 👉 ${value}`

        return {
          type: 'remToSpacing',
          text,
          px: `${px}px`,
          pxValue: px,
          remValue: resultValue,
          rem: value,
          value,
          label,
          documentation: localize(
            'remToSpacing.documentation',
            'Convert {0}rem to {1}',
            px,
            value,
            conf.rootFontSize
          ),
        }
      },
    },
  }
}
