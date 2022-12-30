import { ConvertResult, Line, Rule, RuleOPType, Type } from './types'
import { RULES } from '../rules'
import { Position, Range, Selection, TextEditor } from 'vscode'
import { isIngore } from './helpers'

export class CSSProcessor {
  convert(line: Line): ConvertResult[] | null {
    const rules = this.getConvertRule('singleTest', line)

    if (rules.length === 0) {
      return null
    }

    const result = rules
      .map((i) => {
        if (
          typeof i.rule.convert?.convertCondition === 'function' &&
          !i.rule.convert.convertCondition(line)
        ) {
          return null
        }

        if (typeof i.rule.convert?.convertHandler === 'function') {
          return i.rule.convert.convertHandler(i.text, line)
        }

        return null
      })
      .filter(Boolean) as ConvertResult[]

    if (result.length) {
      return result
    }

    return null
  }

  convertAll(line: string, ingores: string[], type: Type): string {
    if (!line) {
      return line
    }

    const rule = RULES.find((w) => w.type === type) as Rule

    if (!rule.convert?.allTest) {
      return line
    }

    return line.replace(rule.convert?.allTest, (word: string) => {
      if (ingores.includes(word)) {
        return word
      }

      if (!rule.convert?.convertHandler) {
        return word
      }

      const res = rule.convert.convertHandler(word, line)

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

    const line = doc.getText(selection) as Line

    textEditor.edit((builder) => {
      builder.replace(
        selection,
        this.convertAll(line, ingoresViaCommand, type)
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
