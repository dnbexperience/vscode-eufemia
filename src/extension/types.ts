export type Type =
  | 'handleValues'
  | 'handleSpacing'
  | 'handleCalc'
  | 'handleFontSize'
  | 'handleLineHeight'

export type Config = {
  /**
   * root font-size (unit: px), default: 16
   */
  rootFontSize: number

  /**
   * Px to rem decimal point maximum length, default: 6
   */
  fixedDigits: number

  /**
   * Automatically remove prefix 0, default: true
   */
  autoRemovePrefixZero: boolean

  /**
   * Ignores `px` to `rem` when trigger command, can be set `[ \"1px\", \"0.5px\" ]`, default: []
   */
  ingoresViaCommand: string[]

  /**
   * Whether to enabled mark, default: false
   */
  addMark: boolean

  /**
   * Whether to enable display conversion data on hover, Default: onlyMark
   */
  hover: 'disabled' | 'always' | 'onlyMark'

  /**
   * Whether to display mark in after line, `disabled`: Disabled, `show` Show
   */
  currentLine: 'disabled' | 'show'

  /**
   * What to ignore
   */
  ingores: string[]

  /**
   * Defined the generated "calc('large', 'small)" method name
   */
  calcMethodName: string

  /**
   * List of CSS properties that are know for spacing
   */
  spacingProperties: string[]

  /**
   * Supported code syntax languages
   */
  languages: string[]
}

export type Line = string

export type Rule = {
  type: Type
  convert?: {
    allTest?: RegExp
    singleTest?: RegExp
    convertHandler?: (text: string, line?: Line) => ConvertResult
    convertCondition?: (line: Line) => boolean
  }
  hover?: {
    hoverTest?: RegExp | null
    hoverHandler?: (text: string, line?: Line) => HoverResult | null
    hoverCondition?: (line: Line) => boolean
  }
}

export type RuleOPType = 'singleTest' | 'allTest'

export type ConvertResult = {
  type: string
  text: string
  px?: string
  pxValue?: number | string
  rem?: string
  remValue?: number | string
  label: string
  value: string
  documentation?: string
}

export type HoverResult = {
  type: string
  from: string
  to: string
  documentation?: string
}
