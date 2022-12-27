import {
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  MarkdownString,
  Position,
  Range,
  TextDocument,
} from 'vscode'
import { conf, isIngore } from './init'
import { CSSProcessor } from './convert'

export default class implements CompletionItemProvider {
  constructor(private lan: string, private process: CSSProcessor) {}

  provideCompletionItems(
    document: TextDocument,
    position: Position
  ): Thenable<CompletionItem[]> {
    if (isIngore(document.uri)) {
      return Promise.resolve([])
    }

    return new Promise((resolve) => {
      const lineText = document.getText(
        new Range(position.with(undefined, 0), position)
      )
      const res = this.process.convert(lineText)
      if (!res || res.length === 0) {
        return resolve([])
      }

      return resolve(
        res.map((i, idx) => {
          const item = new CompletionItem(
            i.label,
            CompletionItemKind.Snippet
          )
          if (i.documentation) {
            item.documentation = new MarkdownString(i.documentation)
          }
          item.preselect = idx === 0
          item.insertText =
            i.value + (conf.addMark ? ` /* ${i.label} */` : ``)
          return item
        })
      )
    })
  }
}
