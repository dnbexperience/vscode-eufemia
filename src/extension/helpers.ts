import * as nls from 'vscode-nls'
import { existsSync, readFileSync } from 'fs'
import { parse } from 'jsonc-parser'
import { join, resolve } from 'path'
import { Uri, workspace } from 'vscode'
import { Config } from './types'

export let conf!: Config
export const eufemiaConfigFileName = '.vscode-eufemia.json'

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
    console.warn(`File not found: ${eufemiaConfigPath}`)
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
    conf.languages = getConfig().languages
  }
}

function setConfig() {
  const tmp = { ...workspace.getConfiguration('eufemia') }

  Object.keys(tmp).forEach((key) => {
    const k = key
    if (typeof tmp[k] === 'function') {
      delete tmp[k]
    }
  })

  conf = tmp as unknown as Config
}

export function loadConfig() {
  setConfig()
  loadConfigViaFile()
  initIngores()
  initLanguages()
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

export function findNearestTypes(
  size: number,
  list: Record<string, string>,
  initialValue = 'basis'
) {
  const items = Object.entries(list).sort(
    ([, a], [, b]) => parseFloat(a) - parseFloat(b)
  )
  const last = items.at(-1)

  for (const item of items) {
    const [type, value] = item
    if (parseFloat(value) >= size || last?.[0] === type) {
      initialValue = type
      break
    }
  }

  return initialValue
}

export function cleanProperties(
  findKey: string,
  properties: Record<string, string>
): Record<string, string> {
  return Object.entries(properties).reduce(
    (acc: Record<string, string>, [key, value]) => {
      if (key.includes(findKey)) {
        acc[key.replace(findKey, '')] = value.replace('rem', '')
      }
      return acc
    },
    {}
  )
}

type ValueOf<T> = T[keyof T]
type ConfigKey = keyof Config
type ConfigItemValue = { default: ValueOf<Config> }
type ConfigItem = [ConfigKey, ConfigItemValue]
type ConfigItems = ConfigItem[]
type Accumulator = Record<ConfigKey, ValueOf<Config>>

export function getConfig() {
  const items = Object.entries(
    JSON.parse(
      readFileSync(resolve(__dirname, '../../package.json'), 'utf-8')
    ).contributes.configuration.properties
  ) as ConfigItems

  return items.reduce((acc, [name, value]) => {
    const key = name.replace('eufemia.', '') as ConfigKey
    acc[key] = value.default
    return acc
  }, {} as Accumulator) as Config
}
