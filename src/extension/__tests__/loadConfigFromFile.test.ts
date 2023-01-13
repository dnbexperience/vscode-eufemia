import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import * as vscode from 'vscode'
import { getConfig, loadConfigFromFile, conf } from '../helpers'
import * as helpers from '../helpers'
import * as nodeFs from 'fs'
import * as nodePath from 'path'

vi.mock('fs', async () => {
  const original = (await vi.importActual('fs')) as {
    readFileSync: (
      file: nodeFs.PathOrFileDescriptor,
      encoding: BufferEncoding
    ) => string
    existsSync: (file: nodeFs.PathOrFileDescriptor) => boolean
  }

  return {
    ...original,
    readFileSync: vi.fn((file, encoding) => {
      if (file.includes('package.json')) {
        return original.readFileSync(file, encoding)
      }

      return JSON.stringify({})
    }),
  }
})

vi.mock('path', async () => {
  const original = (await vi.importActual('path')) as {
    resolve: (...paths: string[]) => string
  }

  return {
    ...original,
  }
})

vi.mock('vscode', () => {
  const workspace = {
    getConfiguration: () => getConfig(),
  }
  const window = {}

  return { workspace, window }
})

describe('loadConfigFromFile', () => {
  beforeEach(() => {
    const dirPath = '/Users/user/dir'
    const fileName = `${dirPath}/file.css`

    vscode.window.activeTextEditor = {
      document: { fileName },
    } as vscode.TextEditor

    const readFileSync = vi.fn(() => {
      return JSON.stringify({ foo: 'bar' })
    })
    vi.spyOn(nodeFs, 'readFileSync').mockImplementation(readFileSync)

    const existsSync = vi.fn((file) => {
      return file.includes('.vscode-eufemia.json')
    })
    vi.spyOn(nodeFs, 'existsSync').mockImplementation(existsSync)

    const resolve = vi.fn(() => {
      return dirPath
    })
    vi.spyOn(nodePath, 'resolve').mockImplementation(resolve)

    const info = vi.fn()
    vi.spyOn(console, 'info').mockImplementation(info)
  })

  it('should load and set config', () => {
    loadConfigFromFile()

    expect(conf).toEqual(
      expect.objectContaining({
        foo: 'bar',
      })
    )
    expect(console.info).toHaveBeenCalledTimes(1)
    expect(console.info).toHaveBeenCalledWith(
      'Using config from file: /Users/user/dir/.vscode-eufemia.json'
    )
  })
})
