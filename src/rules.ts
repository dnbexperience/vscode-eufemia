import * as nls from 'vscode-nls'
import { cleanZero, conf, isSpacing } from './extension/init'
import { Rule } from './extension/types'
import {
  calc,
  spacePatterns,
} from '@dnb/eufemia/components/space/SpacingUtils'

const localize = nls.config({ messageFormat: nls.MessageFormat.both })()

export const RULES: Rule[] = []

export function initRules() {
  RULES.length = 0
  RULES.push(
    {
      type: 'pxToRem',
      convert: {
        allTest: /([-]?[\d.]+)px/g,
        singleTest: /([-]?[\d.]+)p(x)?$/,
        fn: (text) => {
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
        hoverFn: (pxText) => {
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
    },
    {
      type: 'remToPx',
      convert: {
        allTest: /([-]?[\d.]+)rem/g,
        singleTest: /([-]?[\d.]+)r(e|em)?$/,
        fn: (text) => {
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
        hoverFn: (remText) => {
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
    },
    {
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
    },
    {
      type: 'remToSpacing',
      convert: {
        allTest: /([-]?[\d.]+)rem/g,
        singleTest: /([-]?[\d.]+)r(e|em)?$/,
        fnCondition: (text) => isSpacing(text),
        fn: (text) => {
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
    },
    {
      type: 'spacingInfo',
      hover: {
        hoverTest: /var\(--spacing-([^)]*)\)/,
        hoverFn: (calcText) => {
          let remVal = 0

          const patterns = spacePatterns as Record<string, number>
          const spaceTypes = calcText.matchAll(
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
          const px = +(remVal * conf.rootFontSize).toFixed(
            conf.fixedDigits
          )

          return {
            type: 'spacingInfo',
            from: calcText,
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
  )
}
