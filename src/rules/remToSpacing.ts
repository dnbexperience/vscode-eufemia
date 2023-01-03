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
        const rem = parseFloat(text)
        const px = +(rem * conf.rootFontSize).toFixed(conf.fixedDigits)
        let value = calc(rem + 'rem')
        if (value.split('var').length - 1 === 1) {
          value = value.replace(/calc\(([^)]*)\)/, '$1')
        }
        const label = `${rem}rem 👉 ${value}`

        return {
          type: 'remToSpacing',
          text,
          px: `${px}px`,
          pxValue: px,
          remValue: rem,
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
