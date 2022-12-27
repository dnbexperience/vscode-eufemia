import {
  Hover,
  HoverProvider,
  MarkdownString,
  Position,
  ProviderResult,
  TextDocument,
} from 'vscode'
import { conf, isIngore } from './init'
import { RULES } from '../rules'

export default class implements HoverProvider {
  private getText(line: string, pos: Position): string {
    const point = pos.character
    let text = ''

    line.replace(/[.0-9]+(px|rem)/g, (a, _, idx) => {
      const start = idx + 1
      const end = idx + a.length + 1
      if (!text && point >= start && point <= end) {
        text = a
      }
      return ''
    })

    return text
  }

  provideHover(doc: TextDocument, pos: Position): ProviderResult<Hover> {
    if (isIngore(doc.uri)) {
      return null
    }

    const line = doc.lineAt(pos.line).text.trim()
    const text = this.getText(line, pos)

    if (!text) {
      return null
    }

    let results = RULES.filter((w) => w?.hover?.hoverTest?.test(text))
      .map((rule) => {
        if (typeof rule.hover?.hoverFn === 'function') {
          return rule.hover.hoverFn(text)
        }
      })
      .filter((h) => h !== null && h?.documentation)

    if (conf.hover === 'onlyMark') {
      results = results.filter((w) => !line.includes(`/* ${w?.type} */`))
    }

    if (results.length === 0) {
      return null
    }

    if (results.length === 1) {
      return new Hover(new MarkdownString(results[0]?.documentation))
    }

    return new Hover(
      new MarkdownString(results.map((h) => `- ${h?.documentation}`).join('\n'))
    )
  }
}
