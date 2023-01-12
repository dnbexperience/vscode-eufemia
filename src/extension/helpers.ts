import * as nls from 'vscode-nls'
import { Uri, workspace, window } from 'vscode'
import { existsSync, readFileSync } from 'fs'
import { parse } from 'jsonc-parser'
import { join, resolve, dirname } from 'path'
import type { ExtensionContext } from 'vscode'
import type { Config, Line } from './types'

export let conf!: Config
export const configFileName = '.vscode-eufemia.json'

export const localize = nls.config({
  messageFormat: nls.MessageFormat.both,
})()

let CACHE_CONFIG_DIR_PATH: Record<string, string | null> = {}

export function loadConfigFromFile() {
  const activeFilePath = dirname(
    window.activeTextEditor?.document.fileName || ''
  )

  let configDirPath = (CACHE_CONFIG_DIR_PATH?.[activeFilePath] ||
    null) as string

  if (!configDirPath && activeFilePath) {
    const paths = activeFilePath.split(/\/+|\\+/g)

    for (let i = 0, l = paths.length; i < l; i++) {
      const path = resolve(...paths)

      if (
        existsSync(join(path, configFileName)) ||
        // Skip on package.json too, so we not always run this on every file over again (when in same directory)
        existsSync(join(path, 'package.json'))
      ) {
        configDirPath = CACHE_CONFIG_DIR_PATH[activeFilePath] = path
        break
      }

      paths.pop()
    }
  }

  const configFilePath = join(configDirPath, configFileName)

  if (!existsSync(configFilePath)) {
    return // stop here
  }

  try {
    const res = parse(readFileSync(configFilePath, 'utf-8'))
    conf = {
      ...conf,
      ...res,
    }
    console.info(`Using config from file: ${configFilePath}`)
  } catch (e) {
    console.warn(`Parse error in ${configFilePath}`, e)
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

export function initConfig(context: ExtensionContext) {
  loadConfig()

  workspace.onDidChangeConfiguration(loadConfig)
  workspace.onDidOpenTextDocument(loadConfigFromFile)

  const configWatcher = workspace.createFileSystemWatcher(
    `**/${configFileName}`
  )

  configWatcher.onDidChange(loadConfig)
  configWatcher.onDidCreate(loadConfig)
  configWatcher.onDidDelete(loadConfig)

  context.subscriptions.push(configWatcher)
}

export function loadConfig() {
  setConfig()
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

export function findNearestType(
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

export function matchLineWhen(line: Line) {
  return line.match(
    // 1. Do skip support for comments, like // 3rem
    // 2. Match px/rem values like "5rem"
    // 3. Match px/rem values, like "0.5rem" or ".5rem"
    // 4. Match CSS var(--*)
    // 5. Match JS calc('*')
    new RegExp(
      `(?<!\\\/\\\/.*)((\\\d+(px|rem))|(\\\d{0,}\.\\\d+(px|rem))|var\\\(--(.*)\\\)|${conf.calcMethodName}\\\(['"\\\`](.*)\\\))`,
      'g'
    )
  )
}
