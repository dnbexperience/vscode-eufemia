import { cleanZero, conf, localize } from '../extension/helpers'
import { Rule } from '../extension/types'

export const remToPx = (): Rule => {
  return {
    type: 'remToPx',
    convert: {
      allTest: /([-]?[\d.]+)rem/g,
      singleTest: /([-]?[\d.]+)r(e|em)?$/,
      convertHandler: (text) => {
        const px = parseFloat(text)
        const resultValue = +(px * conf.rootFontSize).toFixed(
          conf.fixedDigits
        )
        const value = cleanZero(resultValue) + 'px'
        const label = `${px}rem 👉 ${value}`

        return {
          type: 'remToPx',
          text,
          px: `${px}px`,
          pxValue: px,
          remValue: resultValue,
          rem: value,
          value,
          label,
          documentation: localize(
            'remToPx.documentation',
            'Convert {0}rem to {1}',
            px,
            value,
            conf.rootFontSize
          ),
        }
      },
    },
    hover: {
      hoverTest: /(?<!var.*)([-]?[\d.]+)rem/,
      hoverHandler: (remText) => {
        const rem = parseFloat(remText)
        const val = +(rem * conf.rootFontSize).toFixed(conf.fixedDigits)

        return {
          type: 'remToPx',
          from: `${rem}rem`,
          to: `${val}px`,
          documentation: localize(
            'remToPx.documentation.hover',
            'Converted from `{0}px`',
            val,
            conf.rootFontSize
          ),
        }
      },
    },
  }
}
