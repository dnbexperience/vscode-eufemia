// // The module 'vscode' contains the VS Code extensibility API
// // Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode';

// import CssRemHoverProvider from './hover'
// import { LineAnnotation } from './line-annotation'

// // This method is called when your extension is activated
// // Your extension is activated the very first time the command is executed
// export function activate(context: vscode.ExtensionContext) {

// 	// Use the console to output diagnostic information (console.log) and errors (console.error)
// 	// This line of code will only be executed once when your extension is activated
// 	console.log('Congratulations, your extension "dnb-eufemia" is now active!');

// 	// The command has been defined in the package.json file
// 	// Now provide the implementation of the command with registerCommand
// 	// The commandId parameter must match the command field in package.json
// 	let disposable = vscode.commands.registerCommand('dnb-eufemia.helloWorld', () => {
// 		// The code you place here will be executed every time your command is executed
// 		// Display a message box to the user
// 		vscode.window.showInformationMessage('Hello World from eufemia!');
// 	});

// 	context.subscriptions.push(disposable);
// }

// // This method is called when your extension is deactivated
// export function deactivate() {}

import { commands, ExtensionContext, languages, workspace } from 'vscode'
import CssRemProvider from './completion'
import { cog, eufemiaConfigFileName, loadConfig } from './config'
import CssRemHoverProvider from './hover'
import { LineAnnotation } from './line-annotation'
import { CssRemProcess } from './process'

let process: CssRemProcess

export function activate(context: ExtensionContext) {
  loadConfig()
  workspace.onDidChangeConfiguration(() => loadConfig())

  process = new CssRemProcess()

  const LANS = [...cog.languages]
  for (const lan of LANS) {
    const providerDisposable = languages.registerCompletionItemProvider(
      lan,
      new CssRemProvider(lan, process)
    )
    context.subscriptions.push(providerDisposable)
  }
  if (cog.hover !== 'disabled') {
    const hoverProvider = new CssRemHoverProvider()
    context.subscriptions.push(
      languages.registerHoverProvider(LANS, hoverProvider)
    )
  }

  const ingoresViaCommand = ((cog.ingoresViaCommand || []) as string[])
    .filter((w) => !!w)
    .map((v) => (v.endsWith('px') ? v : `${v}px`))
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.eufemia', (textEditor) => {
      process.modifyDocument(textEditor, ingoresViaCommand, 'pxToRem')
    }),
    commands.registerTextEditorCommand(
      'extension.eufemia.rem-to-px',
      (textEditor) => {
        process.modifyDocument(textEditor, ingoresViaCommand, 'remToPx')
      }
    ),
    commands.registerTextEditorCommand(
      'extension.eufemia.rem-switch-px',
      (textEditor) => {
        process.modifyDocument(textEditor, ingoresViaCommand, 'pxSwitchRem')
      }
    )
  )

  if (cog.vw) {
    context.subscriptions.push(
      commands.registerTextEditorCommand(
        'extension.eufemia.px-to-vw',
        (textEditor) => {
          process.modifyDocument(textEditor, ingoresViaCommand, 'pxToVw')
        }
      ),
      commands.registerTextEditorCommand(
        'extension.eufemia.vw-to-px',
        (textEditor) => {
          process.modifyDocument(textEditor, ingoresViaCommand, 'vwToPx')
        }
      ),
      commands.registerTextEditorCommand(
        'extension.eufemia.vw-switch-px',
        (textEditor) => {
          process.modifyDocument(textEditor, ingoresViaCommand, 'vwSwitchPx')
        }
      )
    )
  }

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

// this method is called when your extension is deactivated
export function deactivate() {}
