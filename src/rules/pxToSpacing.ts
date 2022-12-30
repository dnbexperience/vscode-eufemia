import { calc } from '@dnb/eufemia/components/space/SpacingUtils'
import { conf, isSpacing, localize } from '../extension/helpers'
import { Rule } from '../extension/types'

export const pxToSpacing = (): Rule => {
  return {
    type: 'pxToSpacing',
    convert: {
      allTest: /([-]?[\d.]+)px/g,
      singleTest: /([-]?[\d.]+)p(x)?$/,
      fnCondition: (text) => isSpacing(text),
      fn: (text) => {
        const px = parseFloat(text)
        const resultValue = +(px / conf.rootFontSize).toFixed(
          conf.fixedDigits
        )
        let value = calc(px + 'px')
        if (value.split('var').length - 1 === 1) {
          value = value.replace(/calc\(([^)]*)\)/, '$1')
        }
        const label = `${px}px 👉 ${value}`

        return {
          type: 'pxToSpacing',
          text,
          px: `${px}px`,
          pxValue: px,
          remValue: resultValue,
          rem: value,
          value,
          label,
          documentation: localize(
            'pxToSpacing.documentation',
            'Convert `{0}px` to `{1}`',
            px,
            value,
            conf.rootFontSize
          ),
        }
      },
    },
  }
}
