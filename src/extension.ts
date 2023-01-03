import { commands, ExtensionContext, languages, workspace } from 'vscode'
import CssRemProvider from './extension/completion'
import {
  conf,
  eufemiaConfigFileName,
  loadConfig,
} from './extension/helpers'
import { initRules } from './rules'
import CssRemHoverProvider from './extension/hover'
import { LineAnnotation } from './extension/annotation'
import { CSSProcessor } from './extension/convert'

let process: CSSProcessor

export function activate(context: ExtensionContext) {
  const init = () => {
    loadConfig()
    initRules()
  }

  init()
  workspace.onDidChangeConfiguration(init)

  process = new CSSProcessor()

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

  const eufemiaConfigWatcher = workspace.createFileSystemWatcher(
    `**/${eufemiaConfigFileName}`
  )

  eufemiaConfigWatcher.onDidChange(() => loadConfig())
  eufemiaConfigWatcher.onDidCreate(() => loadConfig())
  eufemiaConfigWatcher.onDidDelete(() => loadConfig())

  context.subscriptions.push(eufemiaConfigWatcher)
}

export function deactivate() {}
