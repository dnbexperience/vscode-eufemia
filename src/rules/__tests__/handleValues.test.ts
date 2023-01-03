import { readFileSync } from 'fs'
import { resolve } from 'path'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { handleValues } from '../handleValues'
import { loadConfig } from '../../extension/helpers'

const config = JSON.parse(
  readFileSync(resolve(__dirname, '../../../.eufemia'), 'utf-8')
)

vi.mock('vscode', () => {
  const workspace = {
    getConfiguration: () => config,
  }

  return { workspace }
})

beforeAll(() => {
  loadConfig()
})

describe('convert', () => {
  describe('singleTest', () => {
    it('should match on px number', () => {
      const rule = handleValues()
      expect('-10.5px').toMatch(rule.convert?.singleTest || '')
    })

    it('should match on rem number', () => {
      const rule = handleValues()
      expect('-10.5rem').toMatch(rule.convert?.singleTest || '')
    })

    it('should not match on invalid number', () => {
      const rule = handleValues()
      expect('-10.5vh').not.toMatch(rule.convert?.singleTest || '')
    })
  })

  describe('allTest', () => {
    it('should match on px number', () => {
      const rule = handleValues()
      expect('-10.5px +10.5px').toMatch(rule.convert?.allTest || '')
    })

    it('should match on rem number', () => {
      const rule = handleValues()
      expect('-10.5rem +10.5rem').toMatch(rule.convert?.allTest || '')
    })

    it('should not match on invalid number', () => {
      const rule = handleValues()
      expect('-10.5vh').not.toMatch(rule.convert?.allTest || '')
    })

    it('should match when one is valid number', () => {
      const rule = handleValues()
      expect('-10.5vh -10.5rem').toMatch(rule.convert?.allTest || '')
    })
  })

  describe('convertHandler', () => {
    it('should convert px to rem', () => {
      const rule = handleValues()
      const text = '-10.5px'
      const line = `margin-top: ${text};`
      const result = rule.convert?.convertHandler?.(text, line)

      expect(result).toEqual({
        documentation: 'Convert -10.5px to -0.656rem',
        label: '-10.5px 👉 -0.656rem',
        px: '-10.5px',
        pxValue: -10.5,
        rem: '-0.656rem',
        remValue: -0.656,
        text: '-10.5px',
        type: 'handleValues',
        value: '-0.656rem',
      })
    })

    it('should convert rem to px', () => {
      const rule = handleValues()
      const text = '-10.5rem'
      const line = `margin-top: ${text};`
      const result = rule.convert?.convertHandler?.(text, line)

      expect(result).toEqual({
        documentation: 'Convert -10.5rem to -168px',
        label: '-10.5rem 👉 -168px',
        px: '-168px',
        pxValue: -168,
        rem: '-10.5rem',
        remValue: -10.5,
        text: '-10.5rem',
        type: 'handleValues',
        value: '-168px',
      })
    })
  })
})

describe('hover', () => {
  describe('hoverTest', () => {
    it('should match on px number', () => {
      const rule = handleValues()
      expect('-10.5px').toMatch(rule.hover?.hoverTest || '')
    })

    it('should match on rem number', () => {
      const rule = handleValues()
      expect('-10.5rem').toMatch(rule.hover?.hoverTest || '')
    })

    it('should match on number with foo', () => {
      const rule = handleValues()
      expect('foo -10.5rem').toMatch(rule.hover?.hoverTest || '')
    })

    it('should not match on number with var', () => {
      const rule = handleValues()
      expect('var -10.5rem').not.toMatch(rule.hover?.hoverTest || '')
    })

    it('should not match on invalid number', () => {
      const rule = handleValues()
      expect('-10.5vh').not.toMatch(rule.hover?.hoverTest || '')
    })
  })

  describe('hoverHandler', () => {
    it('should show px to rem', () => {
      const rule = handleValues()
      const text = '-10.5px'
      const line = `margin-top: ${text};`
      const result = rule.hover?.hoverHandler?.(text, line)

      expect(result).toEqual({
        documentation: 'Converted from `-10.5px`',
        from: '-10.5px',
        to: '-0.656rem',
        type: 'handleValues',
      })
    })

    it('should show rem to px', () => {
      const rule = handleValues()
      const text = '-10.5rem'
      const line = `margin-top: ${text};`
      const result = rule.hover?.hoverHandler?.(text, line)

      expect(result).toEqual({
        documentation: 'Converted from `-10.5rem`',
        from: '-10.5rem',
        to: '-168px',
        type: 'handleValues',
      })
    })
  })
})
