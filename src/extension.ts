import { commands, languages } from 'vscode'
import CssRemProvider from './extension/completion'
import { conf, initConfig } from './extension/helpers'
import { initRules } from './rules'
import CssRemHoverProvider from './extension/hover'
import { LineAnnotation } from './extension/annotation'
import { CSSProcessor } from './extension/convert'
import type { ExtensionContext } from 'vscode'

export function activate(context: ExtensionContext) {
  initConfig(context)
  initRules()

  let process = new CSSProcessor()

  const syntaxLanguages = [...conf.languages]
  for (const lang of syntaxLanguages) {
    const providerDisposable = languages.registerCompletionItemProvider(
      lang,
      new CssRemProvider(lang, process)
    )
    context.subscriptions.push(providerDisposable)
  }

  if (conf.hover !== 'disabled') {
    const hoverProvider = new CssRemHoverProvider()
    context.subscriptions.push(
      languages.registerHoverProvider(syntaxLanguages, hoverProvider)
    )
  }

  const ingoresViaCommand = ((conf.ingoresViaCommand || []) as string[])
    .filter((w) => !!w)
    .map((v) => (v.endsWith('px') ? v : `${v}px`))

  context.subscriptions.push(
    commands.registerTextEditorCommand(
      'extension.eufemia.px-to-rem',
      (textEditor) => {
        process.modifyDocument(
          textEditor,
          ingoresViaCommand,
          'handleValues'
        )
      }
    ),
    commands.registerTextEditorCommand(
      'extension.eufemia.convert-to-spacing',
      (textEditor) => {
        process.modifyDocument(
          textEditor,
          ingoresViaCommand,
          'handleSpacing'
        )
      }
    ),
    commands.registerTextEditorCommand(
      'extension.eufemia.convert-to-calc',
      (textEditor) => {
        process.modifyDocument(textEditor, ingoresViaCommand, 'handleCalc')
      }
    )
  )

  if (conf.currentLine !== 'disabled') {
    context.subscriptions.push(new LineAnnotation())
  }
}

export function deactivate() {}
