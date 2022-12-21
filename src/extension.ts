import { commands, ExtensionContext, languages, workspace } from 'vscode'
import CssRemProvider from './completion'
import { cog, eufemiaConfigFileName, loadConfig } from './config'
import CssRemHoverProvider from './hover'
import { LineAnnotation } from './annotation'
import { CSSProcessor } from './process'

let process: CSSProcessor

export function activate(context: ExtensionContext) {
  loadConfig()
  workspace.onDidChangeConfiguration(() => loadConfig())

  process = new CSSProcessor()

  const syntaxLanguages = [...cog.languages]
  for (const lang of syntaxLanguages) {
    const providerDisposable = languages.registerCompletionItemProvider(
      lang,
      new CssRemProvider(lang, process)
    )
    context.subscriptions.push(providerDisposable)
  }
  if (cog.hover !== 'disabled') {
    const hoverProvider = new CssRemHoverProvider()
    context.subscriptions.push(
      languages.registerHoverProvider(syntaxLanguages, hoverProvider)
    )
  }

  const ingoresViaCommand = ((cog.ingoresViaCommand || []) as string[])
    .filter((w) => !!w)
    .map((v) => (v.endsWith('px') ? v : `${v}px`))

  context.subscriptions.push(
    commands.registerTextEditorCommand(
      'extension.eufemia.px-to-spacing',
      (textEditor) => {
        process.modifyDocument(textEditor, ingoresViaCommand, 'pxToSpacing')
      }
    ),
    commands.registerTextEditorCommand(
      'extension.eufemia.px-to-rem',
      (textEditor) => {
        process.modifyDocument(textEditor, ingoresViaCommand, 'pxToRem')
      }
    ),
    commands.registerTextEditorCommand(
      'extension.eufemia.rem-to-spacing',
      (textEditor) => {
        process.modifyDocument(textEditor, ingoresViaCommand, 'remToSpacing')
      }
    )
  )

  if (cog.currentLine !== 'disabled') {
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
