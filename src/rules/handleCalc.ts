import {
  calc as calcSpacing,
  spacePatterns,
} from '@dnb/eufemia/components/space/SpacingUtils'
import { conf, isSpacing, localize } from '../extension/helpers'
import type { Rule } from '../extension/types'

export const handleCalc = (): Rule => {
  return {
    type: 'handleCalc',
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
        const toValue = calcSpacing(value + unit)
          .replace(/var\(--spacing-([^)]*)\)/g, "'$1'")
          .replace(/ \+ /g, ', ')
        const label = `${value}${unit} 👉 ${toValue}`

        return {
          type: 'handleCalc',
          text,
          px: `${px}px`,
          pxValue: px,
          rem: `${rem}rem`,
          remValue: rem,
          value: toValue,
          label,
          documentation: localize(
            'handleCalc.documentation',
            `Convert {0}${unit} to {1}`,
            value,
            toValue,
            conf.rootFontSize
          ),
        }
      },
    },
    hover: {
      hoverTest: /calc\(['"\`]([^)]*)\)/,
      hoverHandler: (text) => {
        let remVal = 0

        const patterns = spacePatterns as Record<string, number>
        const spaceTypes = text.matchAll(/['"\`]([^'"\`]*)['"\`]/g)

        Array.from(spaceTypes).forEach((spacing) => {
          const space = spacing?.[1]
          remVal += patterns[space]
        })

        const rem = +remVal.toFixed(conf.fixedDigits)
        const px = +(remVal * conf.rootFontSize).toFixed(conf.fixedDigits)

        return {
          type: 'handleCalc',
          from: text,
          to: `${rem}rem (${px}px)`,
          documentation: localize(
            'handleCalc.documentation.hover',
            'Converted from `{0}`',
            rem,
            conf.rootFontSize
          ),
        }
      },
    },
  }
}
