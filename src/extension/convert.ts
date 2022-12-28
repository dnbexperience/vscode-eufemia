import { ConvertResult, Rule, RuleOPType, Type } from './types'
import { RULES } from '../rules'
import { Position, Range, Selection, TextEditor } from 'vscode'
import { isIngore } from './init'

export class CSSProcessor {
  convert(text: string): ConvertResult[] | null {
    const rules = this.getConvertRule('singleTest', text)

    if (rules.length === 0) {
      return null
    }

    const result = rules
      .map((i) => {
        if (
          typeof i.rule.convert?.fnCondition === 'function' &&
          !i.rule.convert.fnCondition(text)
        ) {
          return null
        }

        if (typeof i.rule.convert?.fn === 'function') {
          return i.rule.convert.fn(i.text, text)
        }

        return null
      })
      .filter(Boolean) as ConvertResult[]

    if (result.length) {
      return result
    }

    return null
  }

  convertAll(code: string, ingores: string[], type: Type): string {
    if (!code) {
      return code
    }

    const rule = RULES.find((w) => w.type === type) as Rule

    if (!rule.convert?.allTest) {
      return code
    }

    return code.replace(rule.convert?.allTest, (word: string) => {
      if (ingores.includes(word)) {
        return word
      }

      if (!rule.convert?.fn) {
        return word
      }

      const res = rule.convert.fn(word)

      if (res) {
        return res.value
      }

      return word
    })
  }

  private getConvertRule(
    type: RuleOPType,
    text: string
  ): { rule: Rule; text: string }[] {
    const result: { rule: Rule; text: string }[] = []
    for (const rule of RULES) {
      const match = text.match(rule.convert?.[type] || '')
      if (match && match[1]) {
        result.push({ rule, text: match[1] })
      }
    }
    return result
  }

  private getWordRange(textEditor: TextEditor, type: Type): Range | null {
    const position = new Position(
      textEditor.selection.start.line,
      textEditor.selection.start.character
    )

    const range = textEditor.document.getWordRangeAtPosition(position)

    if (!range) {
      return null
    }

    const word = textEditor.document.getText(range)

    if (!word) {
      return null
    }

    const rule = RULES.find((w) => w.type === type)

    return rule?.convert?.allTest?.test(word) ? range : null
  }

  modifyDocument(
    textEditor: TextEditor,
    ingoresViaCommand: string[],
    type: Type
  ) {
    const doc = textEditor.document

    if (isIngore(doc.uri)) {
      return
    }

    let selection: Selection | Range = textEditor.selection

    if (selection.isEmpty && type.toLowerCase().includes('switch')) {
      const wordRange = this.getWordRange(textEditor, type)
      if (wordRange) {
        selection = wordRange
      }
    }

    if (selection.isEmpty) {
      const start = new Position(0, 0)
      const end = new Position(
        doc.lineCount - 1,
        doc.lineAt(doc.lineCount - 1).text.length
      )
      selection = new Range(start, end)
    }

    const text = doc.getText(selection)

    textEditor.edit((builder) => {
      builder.replace(
        selection,
        this.convertAll(text, ingoresViaCommand, type)
      )
    })
  }
}

export function cleanProperties(
  findKey: string,
  properties: Record<string, string>
): Record<string, string> {
  return Object.entries(properties).reduce(
    (acc: Record<string, string>, [key, value]) => {
      if (key.includes(findKey)) {
        acc[key.replace(findKey, '')] = value.replace('rem', '')
      }
      return acc
    },
    {}
  )
}

export function findNearestTypes(
  size: number,
  list: Record<string, string>,
  initialValue = 'basis'
) {
  const items = Object.entries(list).sort(
    ([, a], [, b]) => parseFloat(a) - parseFloat(b)
  )
  const last = items.at(-1)

  for (const item of items) {
    const [type, value] = item
    if (parseFloat(value) >= size || last?.[0] === type) {
      initialValue = type
      break
    }
  }

  return initialValue
}
