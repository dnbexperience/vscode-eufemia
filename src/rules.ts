import * as nls from 'vscode-nls'
import { cog } from './config'
import { Rule } from './interface'
import { calc, spacePatterns } from '@dnb/eufemia/components/space/SpacingUtils'

const localize = nls.config({ messageFormat: nls.MessageFormat.both })()

export const RULES: Rule[] = []

export function resetRules() {
  RULES.length = 0
  RULES.push(
    {
      type: 'pxToRem',
      all: /([-]?[\d.]+)px/g,
      single: /([-]?[\d.]+)p(x)?$/,
      fn: (text) => {
        const px = parseFloat(text)
        const resultValue = +(px / cog.rootFontSize).toFixed(cog.fixedDigits)
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
            cog.rootFontSize
          ),
        }
      },
      hover: cog.remHover ? /(?<!var.*)([-]?[\d.]+)px/ : null,
      hoverFn: (pxText) => {
        const px = parseFloat(pxText)
        const val = +(px / cog.rootFontSize).toFixed(cog.fixedDigits)

        return {
          type: 'remToPx',
          from: `${px}px`,
          to: `${val}rem`,
          documentation: localize(
            'pxToRem.documentation.hover',
            'Converted from `{0}rem`',
            val,
            cog.rootFontSize
          ),
        }
      },
    },
    {
      type: 'remToPx',
      all: /([-]?[\d.]+)rem/g,
      single: /([-]?[\d.]+)r(e|em)?$/,
      fn: (text) => {
        const px = parseFloat(text)
        const resultValue = +(px * cog.rootFontSize).toFixed(cog.fixedDigits)
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
            cog.rootFontSize
          ),
        }
      },
      hover: /(?<!var.*)([-]?[\d.]+)rem/,
      hoverFn: (remText) => {
        const rem = parseFloat(remText)
        const val = +(rem * cog.rootFontSize).toFixed(cog.fixedDigits)

        return {
          type: 'remToPx',
          from: `${rem}rem`,
          to: `${val}px`,
          documentation: localize(
            'remToPx.documentation.hover',
            'Converted from `{0}px`',
            val,
            cog.rootFontSize
          ),
        }
      },
    },
    {
      type: 'pxToSpacing',
      all: /([-]?[\d.]+)px/g,
      single: /([-]?[\d.]+)p(x)?$/,
      fnCondition: (text) => isSpacing(text),
      fn: (text) => {
        const px = parseFloat(text)
        const resultValue = +(px / cog.rootFontSize).toFixed(cog.fixedDigits)
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
            'Convert `{0}` to `{1}`',
            px,
            value,
            cog.rootFontSize
          ),
        }
      },
    },
    {
      type: 'remToSpacing',
      all: /([-]?[\d.]+)rem/g,
      single: /([-]?[\d.]+)r(e|em)?$/,
      fnCondition: (text) => isSpacing(text),
      fn: (text) => {
        const px = parseFloat(text)
        const resultValue = +(px * cog.rootFontSize).toFixed(cog.fixedDigits)
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
            cog.rootFontSize
          ),
        }
      },
    },
    {
      type: 'spacingToInfo',
      hover: /var\(--spacing-([^)]*)\)/,
      hoverFn: (calcText) => {
        const spaceTypes = calcText.matchAll(
          /([+-]|)\s{0,}var\(--spacing-([^)]*)\)/g
        )
        let remVal = 0
        const patterns = spacePatterns as Record<string, number>
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
        const rem = remVal
        const px = rem * cog.rootFontSize

        return {
          type: 'spacingToInfo',
          from: calcText,
          to: `${rem}rem (${px}px)`,
          documentation: localize(
            'spacingToInfo.documentation.hover',
            'Converted from `{0}`',
            rem,
            cog.rootFontSize
          ),
        }
      },
    }
  )
}

export function isSpacing(text: string) {
  return new RegExp(cog.spacingProperties.join('|')).test(text)
}

function cleanZero(val: number) {
  if (cog.autoRemovePrefixZero) {
    if (val.toString().startsWith('0.')) {
      return val.toString().substring(1)
    }
  }

  return val + ''
}
