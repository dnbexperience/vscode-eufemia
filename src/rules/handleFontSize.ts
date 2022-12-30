import properties from '@dnb/eufemia/style/properties'
import { cleanProperties, findNearestTypes } from '../extension/convert'
import { conf, localize } from '../extension/helpers'
import { Rule } from '../extension/types'

const typeId = `font\-size`
const varId = `\-\-${typeId}\-`
const sizes = cleanProperties(varId, properties)

export const handleFontSize = (): Rule => {
  return {
    type: 'handleFontSize',
    convert: {
      allTest: /([-]?[\d.]+)(px|rem)/g,
      singleTest: /([-]?[\d.]+)(p(x)?|r(e|em)?)$/,
      fnCondition: (text) => new RegExp(typeId).test(text),
      fn: (text, line) => {
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
          type: 'handleFontSize',
          text,
          value: toValue,
          label,
          documentation: localize(
            'handleFontSize.documentation',
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
      hoverFn: (calcText) => {
        let remVal = 0

        const sizeTypes = calcText.matchAll(
          new RegExp(`var\\(${varId}([^)]*)\\)`, 'g')
        )

        remVal = parseFloat(sizes[String(Array.from(sizeTypes)[0][1])])

        if (isNaN(remVal)) {
          return null
        }

        const rem = +remVal.toFixed(conf.fixedDigits)
        const px = +(remVal * conf.rootFontSize).toFixed(conf.fixedDigits)

        return {
          type: 'handleFontSize',
          from: calcText,
          to: `${rem}rem (${px}px)`,
          documentation: localize(
            'handleFontSize.documentation.hover',
            'Converted from `{0}`',
            rem,
            conf.rootFontSize
          ),
        }
      },
    },
  }
}
