import {
  Hover,
  HoverProvider,
  MarkdownString,
  Position,
  ProviderResult,
  TextDocument,
} from 'vscode'
import { conf, isIngore } from './helpers'
import { RULES } from '../rules'
import type { Line } from './types'

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
    const text = this.getText(line, pos) as Line

    if (!text) {
      return null
    }

    let results = RULES.filter((r) => r?.hover?.hoverTest?.test(text))
      .map((r) => {
        if (typeof r.hover?.hoverCondition === 'function') {
          if (!r.hover.hoverCondition(line)) {
            return null
          }
        }

        if (typeof r.hover?.hoverHandler === 'function') {
          return r.hover.hoverHandler(text, line)
        }
      })
      .filter((r) => r !== null && r?.documentation)

    if (conf.hover === 'onlyMark') {
      results = results.filter((r) => !line.includes(`/* ${r?.type} */`))
    }

    if (results.length === 0) {
      return null
    }

    if (results.length === 1) {
      return new Hover(new MarkdownString(results[0]?.documentation))
    }

    return new Hover(
      new MarkdownString(
        results.map((h) => `- ${h?.documentation}`).join('\n')
      )
    )
  }
}
