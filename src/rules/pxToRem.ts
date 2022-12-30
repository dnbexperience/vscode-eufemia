import { cleanZero, conf, localize } from '../extension/helpers'
import { Rule } from '../extension/types'

export const pxToRem = (): Rule => {
  return {
    type: 'pxToRem',
    convert: {
      allTest: /([-]?[\d.]+)px/g,
      singleTest: /([-]?[\d.]+)p(x)?$/,
      convertHandler: (text) => {
        const px = parseFloat(text)
        const resultValue = +(px / conf.rootFontSize).toFixed(
          conf.fixedDigits
        )
        const value = cleanZero(resultValue) + 'rem'
        const label = `${px}px 👉 ${value}`

        return {
          type: 'pxToRem',
          text,
          px: `${px}px`,
          pxValue: px,
          remValue: resultValue,
          rem: value,
          value,
          label,
          documentation: localize(
            'pxToRem.documentation',
            'Convert `{0}px` to `{1}`',
            px,
            value,
            conf.rootFontSize
          ),
        }
      },
    },
    hover: {
      hoverTest: conf.remHover ? /(?<!var.*)([-]?[\d.]+)px/ : null,
      hoverHandler: (pxText) => {
        const px = parseFloat(pxText)
        const val = +(px / conf.rootFontSize).toFixed(conf.fixedDigits)

        return {
          type: 'remToPx',
          from: `${px}px`,
          to: `${val}rem`,
          documentation: localize(
            'pxToRem.documentation.hover',
            'Converted from `{0}rem`',
            val,
            conf.rootFontSize
          ),
        }
      },
    },
  }
}
