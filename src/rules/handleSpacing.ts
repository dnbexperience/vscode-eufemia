import {
  calc as calcSpacing,
  spacePatterns,
} from '@dnb/eufemia/components/space/SpacingUtils'
import { conf, isSpacing, localize } from '../extension/helpers'
import type { Rule } from '../extension/types'

export const handleSpacing = (): Rule => {
  return {
    type: 'handleSpacing',
    convert: {
      allTest: /([-]?[\d.]+)(px|rem)/g,
      singleTest: /([-]?[\d.]+)(p(x)?|r(e|em)?)$/,
      convertCondition: (line) => isSpacing(line),
      convertHandler: (text, line) => {
        const isPx = /([-]?[\d.]+)p(x)?/.test(line || 'px')
        const fromValue = parseFloat(text)

        const rem = +(
          isPx ? fromValue / conf.rootFontSize : fromValue
        ).toFixed(conf.fixedDigits)
        const px = +(
          isPx ? fromValue : fromValue * conf.rootFontSize
        ).toFixed(conf.fixedDigits)

        const unit = isPx ? 'px' : 'rem'
        const value = isPx ? px : rem
        let toValue = calcSpacing(value + unit)
        if (toValue.split('var').length - 1 === 1) {
          toValue = toValue.replace(/calc\(([^)]*)\)/, '$1')
        }
        const label = `${value}${unit} 👉 ${toValue}`

        return {
          type: 'handleSpacing',
          text,
          px: `${px}px`,
          pxValue: px,
          rem: `${rem}rem`,
          remValue: rem,
          value: toValue,
          label,
          documentation: localize(
            'handleSpacing.documentation',
            'Convert `{0}` to `{1}`',
            value + unit,
            toValue,
            conf.rootFontSize
          ),
        }
      },
    },
    hover: {
      hoverTest: /var\(--spacing-([^)]*)\)/,
      hoverHandler: (text) => {
        let remVal = 0

        const patterns = spacePatterns as Record<string, number>
        const spaceTypes = text.matchAll(
          /([+-]|)\s{0,}var\(--spacing-([^)]*)\)/g
        )

        Array.from(spaceTypes).forEach((spacing) => {
          const space = spacing?.[2]
          if (patterns[space]) {
            switch (spacing?.[1]) {
              default:
              case '+':
                remVal += patterns[space]
                break

              case '-':
                remVal -= patterns[space]
                break
            }
          }
        })

        const rem = +remVal.toFixed(conf.fixedDigits)
        const px = +(remVal * conf.rootFontSize).toFixed(conf.fixedDigits)

        return {
          type: 'handleSpacing',
          from: text,
          to: `${rem}rem (${px}px)`,
        }
      },
    },
  }
}
