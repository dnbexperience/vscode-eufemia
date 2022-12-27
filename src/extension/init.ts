import * as nls from 'vscode-nls'
import { existsSync, readFileSync } from 'fs'
import { parse } from 'jsonc-parser'
import { join } from 'path'
import { Uri, workspace } from 'vscode'
import { Config } from './types'
import { initRules } from '../rules'

export let conf!: Config
export const eufemiaConfigFileName = '.eufemia'

export const localize = nls.config({
  messageFormat: nls.MessageFormat.both,
})()

function loadConfigViaFile() {
  if (
    !workspace.workspaceFolders ||
    workspace.workspaceFolders?.length <= 0
  ) {
    return
  }

  const eufemiaConfigPath = join(
    workspace.workspaceFolders[0].uri.fsPath,
    eufemiaConfigFileName
  )
  if (!existsSync(eufemiaConfigPath)) {
    console.log(`Not found file: ${eufemiaConfigPath}`)
    return
  }
  try {
    const res = parse(readFileSync(eufemiaConfigPath).toString('utf-8'))
    conf = {
      ...conf,
      ...res,
    }
    console.warn(`Use override config via ${eufemiaConfigPath} file`)
  } catch (ex) {
    console.warn(`Parse error in ${eufemiaConfigPath}`, ex)
  }
}

function initIngores() {
  if (!Array.isArray(conf.ingores)) {
    conf.ingores = []
  }

  if (
    !workspace.workspaceFolders ||
    workspace.workspaceFolders?.length <= 0
  ) {
    return
  }

  const rootPath = workspace.workspaceFolders[0].uri.path
  conf.ingores = conf.ingores.map((p) => join(rootPath, p))
}

function initLanguages() {
  if (!Array.isArray(conf.languages)) {
    conf.languages = []
  }
  if (conf.languages.length > 0) {
    return
  }
  conf.languages = [
    'css',
    'scss',
    'sass',
    'javascriptreact',
    'typescriptreact',
  ]
}

export function loadConfig() {
  conf = { ...(workspace.getConfiguration('eufemia') as any) }

  Object.keys(conf).forEach((key) => {
    const cur = conf as any
    if (typeof cur[key] === 'function') {
      delete cur[key]
    }
  })

  loadConfigViaFile()
  initIngores()
  initLanguages()
  initRules()

  console.log('Current config', conf)
}

export function isIngore(uri: Uri) {
  return conf.ingores.some((p) => uri.path.startsWith(p))
}

export function isSpacing(text: string) {
  return new RegExp(conf.spacingProperties.join('|')).test(text)
}

export function cleanZero(val: number) {
  if (conf.autoRemovePrefixZero) {
    if (val.toString().startsWith('0.')) {
      return val.toString().substring(1)
    }
  }

  return val + ''
}
