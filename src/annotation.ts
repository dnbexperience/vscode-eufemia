import {
  DecorationOptions,
  DecorationRangeBehavior,
  Disposable,
  Range,
  Selection,
  TextDocument,
  TextEditor,
  TextEditorSelectionChangeEvent,
  ThemeColor,
  window,
} from 'vscode'
import { cog, isIngore } from './config'
import { HoverResult } from './interface'
import { RULES, isSpacing } from './rules'

const annotationDecoration = window.createTextEditorDecorationType({
  after: {
    margin: '0 0 0 1.5em',
    textDecoration: 'none',
  },
  rangeBehavior: DecorationRangeBehavior.ClosedOpen,
})

interface LineSelection {
  anchor: number
  active: number
}

export class LineAnnotation implements Disposable {
  protected _disposable?: Disposable
  private _editor?: TextEditor
  private _enabled = false

  constructor() {
    this._disposable = Disposable.from(
      window.onDidChangeActiveTextEditor(this.onActiveTextEditor, this),
      window.onDidChangeTextEditorSelection(
        this.onTextEditorSelectionChanged,
        this
      )
    )
  }

  private onActiveTextEditor(e: TextEditor | undefined) {
    if (!e) {
      return
    }
    this._enabled =
      cog.languages.includes(e.document.languageId) && !isIngore(e.document.uri)
  }

  private onTextEditorSelectionChanged(e: TextEditorSelectionChangeEvent) {
    if (!this._enabled) {
      return
    }

    if (!this.isTextEditor(e.textEditor)) {
      return
    }

    const selections = this.toLineSelections(e.selections)
    if (
      selections.length === 0 ||
      !selections.every((s) => s.active === s.anchor)
    ) {
      this.clear(e.textEditor)
      return
    }

    this.refresh(e.textEditor, selections[0])
  }

  private async refresh(
    editor: TextEditor | undefined,
    selection: LineSelection
  ) {
    if (!editor?.document || (!editor && !this._editor)) {
      return
    }

    if (this._editor !== editor) {
      this.clear(this._editor)
      this._editor = editor
    }

    const l = selection.active
    const message = this.genMessage(editor.document, l)
    if (!message) {
      this.clear(this._editor)
      return
    }

    const decoration: DecorationOptions = {
      renderOptions: {
        after: {
          backgroundColor: new ThemeColor(
            'extension.eufemia.trailingLineBackgroundColor'
          ),
          color: new ThemeColor(
            'extension.eufemia.trailingLineForegroundColor'
          ),
          contentText: message,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
        },
      },
      range: editor.document.validateRange(
        new Range(l, Number.MAX_SAFE_INTEGER, l, Number.MAX_SAFE_INTEGER)
      ),
    }

    editor.setDecorations(annotationDecoration, [decoration])
  }

  private genMessage(doc: TextDocument, lineNumber: number): string | null {
    const lineText = doc.lineAt(lineNumber).text.trim()

    if (lineText.length <= 0) {
      return null
    }

    const values = lineText.match(/([.0-9]+(px|rem))|var\(--spacing-(.*)\)/g)

    if (!values) {
      return null
    }

    const results = values
      .map((text) => {
        const rule = RULES.filter((w) => w?.hover?.test(text)).map((h) => {
          if (typeof h.hoverFn === 'function') {
            return h.hoverFn(text)
          }
        })

        return {
          text,
          rule,
        }
      })
      .filter((item) => item.rule.length > 0)

    if (results.length <= 0) {
      return null
    }

    if (results.length === 1) {
      const rule = results[0].rule as HoverResult[]
      return this.genMessageItem(rule)
    }

    return results
      .map((res) => {
        const rule = res.rule as HoverResult[]
        return this.genMessageItem(rule)
      })
      .join(', ')
  }

  private genMessageItem(rules: HoverResult[]): string {
    if (rules.length === 1) {
      return rules[0].to
    }

    return (
      `${rules[0].to}👉${rules[0].from}(` +
      rules
        .slice(1)
        .map((v) => `${v.to}👉${v.from}`)
        .join(',') +
      ')'
    )
  }

  private clear(editor: TextEditor | undefined) {
    if (this._editor !== editor && !this._editor) {
      this.clearAnnotations(this._editor)
    }
    this.clearAnnotations(editor)
  }

  private clearAnnotations(editor: TextEditor | undefined) {
    if (editor === undefined || (editor as any)._disposed === true) {
      return
    }

    editor.setDecorations(annotationDecoration, [])
  }

  private isTextEditor(editor: TextEditor): boolean {
    const scheme = editor.document.uri.scheme
    return scheme !== 'output' && scheme !== 'debug'
  }

  dispose() {
    this.clearAnnotations(this._editor)
    this._disposable?.dispose()
  }

  toLineSelections(
    selections: readonly Selection[] | undefined
  ): LineSelection[] {
    return (
      selections?.map((s) => ({
        active: s.active.line,
        anchor: s.anchor.line,
      })) || []
    )
  }
}
