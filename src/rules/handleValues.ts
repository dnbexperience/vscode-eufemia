import { cleanZero, conf, localize } from '../extension/helpers'
import type { Rule } from '../extension/types'

export const handleValues = (): Rule => {
  return {
    type: 'handleValues',
    convert: {
      allTest: /([-]?[\d.]+)(px|rem)/g,
      singleTest: /([-]?[\d.]+)(p(x)?|r(e|em)?)$/,
      convertHandler: (text, line) => {
        const fromValue = parseFloat(text)
        const isPx = /([-]?[\d.]+)p(x)?/.test(line || 'px')

        const rem = +(
          isPx ? fromValue / conf.rootFontSize : fromValue
        ).toFixed(conf.fixedDigits)
        const px = +(
          isPx ? fromValue : fromValue * conf.rootFontSize
        ).toFixed(conf.fixedDigits)

        const fromUnit = isPx ? 'px' : 'rem'
        const toUnit = isPx ? 'rem' : 'px'

        const toValue = cleanZero(isPx ? rem : px)
        const label = `${fromValue}${fromUnit} 👉 ${toValue}${toUnit}`

        return {
          type: 'handleValues',
          text,
          px: `${px}px`,
          pxValue: px,
          rem: `${rem}rem`,
          remValue: rem,
          value: toValue + toUnit,
          label,
          documentation: localize(
            'handleValues.documentation',
            'Convert `{0}` to `{1}`',
            fromValue + fromUnit,
            toValue + toUnit,
            conf.rootFontSize
          ),
        }
      },
    },
    hover: {
      hoverTest: /(?<!var.*)(?<!\/\/.*)([-]?[\d.]+)(px|rem)/,
      hoverHandler: (text) => {
        const match = text.match(
          /(([-]?\d+(px|rem))|([-]?\d+\.\d+(px|rem)))/
        )
        if (match?.[0]) {
          text = match?.[0]
        }

        const fromValue = parseFloat(text)

        if (isNaN(fromValue)) {
          return null
        }

        const isPx = /(?<!\/\/.*)([-]?[\d.]+)p(x)?/.test(text || 'px')

        const rem = +(
          isPx ? fromValue / conf.rootFontSize : fromValue
        ).toFixed(conf.fixedDigits)
        const px = +(
          isPx ? fromValue : fromValue * conf.rootFontSize
        ).toFixed(conf.fixedDigits)

        const fromUnit = isPx ? 'px' : 'rem'
        const toUnit = isPx ? 'rem' : 'px'

        const toValue = isPx ? rem : px

        return {
          type: 'handleValues',
          from: `${fromValue}${fromUnit}`,
          to: `${toValue}${toUnit}`,
          documentation: localize(
            'handleValues.documentation.hover',
            'Equivalent to `{0}`',
            toValue + toUnit,
            conf.rootFontSize
          ),
        }
      },
    },
  }
}
