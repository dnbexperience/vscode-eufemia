import { existsSync, readFileSync } from 'fs'
import { parse } from 'jsonc-parser'
import { join } from 'path'
import { Uri, workspace } from 'vscode'
import { Config } from './interface'
import { resetRules } from './rules'

export let cog!: Config
export const eufemiaConfigFileName = '.eufemia'

function loadConfigViaFile() {
  if (!workspace.workspaceFolders || workspace.workspaceFolders?.length <= 0) {
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
    cog = {
      ...cog,
      ...res,
    }
    console.warn(`Use override config via ${eufemiaConfigPath} file`)
  } catch (ex) {
    console.warn(`Parse error in ${eufemiaConfigPath}`, ex)
  }
}

function fixIngores() {
  if (!Array.isArray(cog.ingores)) {
    cog.ingores = []
  }

  if (!workspace.workspaceFolders || workspace.workspaceFolders?.length <= 0) {
    return
  }

  const rootPath = workspace.workspaceFolders[0].uri.path
  cog.ingores = cog.ingores.map((p) => join(rootPath, p))
}

function fixLanguages() {
  if (!Array.isArray(cog.languages)) {
    cog.languages = []
  }
  if (cog.languages.length > 0) {
    return
  }
  cog.languages = ['css', 'scss', 'sass', 'javascriptreact', 'typescriptreact']
}

export function loadConfig() {
  cog = { ...(workspace.getConfiguration('eufemia') as any) }
  Object.keys(cog).forEach((key) => {
    const cur = cog as any
    if (typeof cur[key] === 'function') {
      delete cur[key]
    }
  })
  loadConfigViaFile()
  fixIngores()
  fixLanguages()
  resetRules()
  console.log('Current config', cog)
}

export function isIngore(uri: Uri) {
  return cog.ingores.some((p) => uri.path.startsWith(p))
}
