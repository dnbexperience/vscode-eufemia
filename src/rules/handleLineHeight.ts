import properties from '@dnb/eufemia/style/properties'
import {
  conf,
  findNearestTypes,
  localize,
  cleanProperties,
} from '../extension/helpers'
import type { Rule } from '../extension/types'

const typeId = `line\-height`
const varId = `\-\-${typeId}\-`
const sizes = cleanProperties(varId, properties)

export const handleLineHeight = (): Rule => {
  return {
    type: 'handleLineHeight',
    convert: {
      allTest: /([\d.]+)(px|rem)/g,
      singleTest: /([\d.]+)(p(x)?|r(e|em)?)$/,
      convertCondition: (line) => new RegExp(typeId).test(line),
      convertHandler: (text, line) => {
        const isPx = line ? /p(x)?/.test(line) : false
        const fromValue = parseFloat(text)
        const resultValue = +(
          isPx ? fromValue / conf.rootFontSize : fromValue
        ).toFixed(conf.fixedDigits)
        const size = findNearestTypes(resultValue, sizes, 'basis')
        const toValue = `var(${varId}${size})`
        const unit = isPx ? 'px' : 'rem'
        const label = `${fromValue}${unit} 👉 ${toValue}`

        return {
          type: 'handleLineHeight',
          text,
          value: toValue,
          label,
          documentation: localize(
            'handleLineHeight.documentation',
            `Convert \`{0}${unit}\` to \`{1}\``,
            fromValue,
            toValue,
            conf.rootFontSize
          ),
        }
      },
    },
    hover: {
      hoverTest: new RegExp(`var\\(${varId}([^)]*)\\)`),
      hoverCondition: (line) => new RegExp(typeId + ':').test(line),
      hoverHandler: (text) => {
        let remVal = 0

        const sizeTypes = text.matchAll(
          new RegExp(`var\\(${varId}([^)]*)\\)`, 'g')
        )

        remVal = parseFloat(sizes[String(Array.from(sizeTypes)[0][1])])

        if (isNaN(remVal)) {
          return null
        }

        const rem = +remVal.toFixed(conf.fixedDigits)
        const px = +(remVal * conf.rootFontSize).toFixed(conf.fixedDigits)

        return {
          type: 'handleLineHeight',
          from: text,
          to: `${rem}rem (${px}px)`,
          documentation: localize(
            'handleLineHeight.documentation.hover',
            'Converted from `{0}`',
            rem,
            conf.rootFontSize
          ),
        }
      },
    },
  }
}
