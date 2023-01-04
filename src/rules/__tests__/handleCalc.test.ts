import { readFileSync } from 'fs'
import { resolve } from 'path'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { handleCalc } from '../handleCalc'
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
      const rule = handleCalc()
      expect('-10.5px').toMatch(rule.convert?.singleTest || '')
    })

    it('should match on rem number', () => {
      const rule = handleCalc()
      expect('-10.5rem').toMatch(rule.convert?.singleTest || '')
    })

    it('should not match on invalid number', () => {
      const rule = handleCalc()
      expect('-10.5vh').not.toMatch(rule.convert?.singleTest || '')
    })
  })

  describe('allTest', () => {
    it('should match on px number', () => {
      const rule = handleCalc()
      expect('-10.5px +10.5px').toMatch(rule.convert?.allTest || '')
    })

    it('should match on rem number', () => {
      const rule = handleCalc()
      expect('-10.5rem +10.5rem').toMatch(rule.convert?.allTest || '')
    })

    it('should not match on invalid number', () => {
      const rule = handleCalc()
      expect('-10.5vh').not.toMatch(rule.convert?.allTest || '')
    })

    it('should match when one is valid number', () => {
      const rule = handleCalc()
      expect('-10.5vh -10.5rem').toMatch(rule.convert?.allTest || '')
    })
  })

  describe('convertHandler', () => {
    it('should convert px to spacing', () => {
      const rule = handleCalc()
      const text = '10.5px'
      const line = `margin-top: ${text};`
      const result = rule.convert?.convertHandler?.(text, line)

      expect(result).toEqual({
        documentation: "Convert 10.5px to calc('x-small')",
        label: "10.5px 👉 calc('x-small')",
        px: '10.5px',
        pxValue: 10.5,
        rem: '0.656rem',
        remValue: 0.656,
        text: '10.5px',
        type: 'handleCalc',
        value: "calc('x-small')",
      })
    })

    it('should convert rem to spacing', () => {
      const rule = handleCalc()
      const text = '10.5rem'
      const line = `margin-top: ${text};`
      const result = rule.convert?.convertHandler?.(text, line)

      expect(result).toEqual({
        documentation:
          "Convert 10.5rem to calc('xx-large', 'xx-large', 'xx-large')",
        label: "10.5rem 👉 calc('xx-large', 'xx-large', 'xx-large')",
        px: '168px',
        pxValue: 168,
        rem: '10.5rem',
        remValue: 10.5,
        text: '10.5rem',
        type: 'handleCalc',
        value: "calc('xx-large', 'xx-large', 'xx-large')",
      })
    })

    it('should result in var only', () => {
      const rule = handleCalc()
      const text = '1rem'
      const line = `margin-top: ${text};`
      const result = rule.convert?.convertHandler?.(text, line)

      expect(result).toEqual({
        documentation: "Convert 1rem to calc('small')",
        label: "1rem 👉 calc('small')",
        px: '16px',
        pxValue: 16,
        rem: '1rem',
        remValue: 1,
        text: '1rem',
        type: 'handleCalc',
        value: "calc('small')",
      })
    })
  })
})

describe('hover', () => {
  describe('hoverTest', () => {
    it('should match spacing type', () => {
      const rule = handleCalc()
      expect(`calc('large')`).toMatch(rule.hover?.hoverTest || '')
    })

    it('should match on spacing type with foo', () => {
      const rule = handleCalc()
      expect(`foo calc('large')`).toMatch(rule.hover?.hoverTest || '')
    })

    it('should match on several spacing types', () => {
      const rule = handleCalc()
      expect(`calc('large', 'small')`).toMatch(rule.hover?.hoverTest || '')
    })

    it('should not match on spacing type with var', () => {
      const rule = handleCalc()
      expect('calc(1 + 2)').not.toMatch(rule.hover?.hoverTest || '')
    })

    it('should not match on invalid spacing type', () => {
      const rule = handleCalc()
      expect('var(--foo-large)').not.toMatch(rule.hover?.hoverTest || '')
    })
  })

  describe('hoverHandler', () => {
    it('should show many spacing types inside calc', () => {
      const rule = handleCalc()
      const text = `calc('large', 'large', 'large')`
      const line = `margin-top: ${text};`
      const result = rule.hover?.hoverHandler?.(text, line)

      expect(result).toEqual({
        from: "calc('large', 'large', 'large')",
        to: '6rem (96px)',
        type: 'handleCalc',
      })
    })

    it('should return null when invalid value was given', () => {
      const rule = handleCalc()
      const text = `calc('large small')`
      const line = `margin-top: ${text};`
      const result = rule.hover?.hoverHandler?.(text, line)

      expect(result).toEqual(null)
    })
  })
})
