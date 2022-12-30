import { spacePatterns } from '@dnb/eufemia/components/space/SpacingUtils'
import { conf, localize } from '../extension/helpers'
import { Rule } from '../extension/types'

export const spacingInfo = (): Rule => {
  return {
    type: 'spacingInfo',
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
          type: 'spacingInfo',
          from: text,
          to: `${rem}rem (${px}px)`,
          documentation: localize(
            'spacingInfo.documentation.hover',
            'Converted from `{0}`',
            rem,
            conf.rootFontSize
          ),
        }
      },
    },
  }
}
