import { readFileSync } from 'fs'
import { resolve } from 'path'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { handleSpacing } from '../handleSpacing'
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
      const rule = handleSpacing()
      expect('-10.5px').toMatch(rule.convert?.singleTest || '')
    })

    it('should match on rem number', () => {
      const rule = handleSpacing()
      expect('-10.5rem').toMatch(rule.convert?.singleTest || '')
    })

    it('should not match on invalid number', () => {
      const rule = handleSpacing()
      expect('-10.5vh').not.toMatch(rule.convert?.singleTest || '')
    })
  })

  describe('allTest', () => {
    it('should match on px number', () => {
      const rule = handleSpacing()
      expect('-10.5px +10.5px').toMatch(rule.convert?.allTest || '')
    })

    it('should match on rem number', () => {
      const rule = handleSpacing()
      expect('-10.5rem +10.5rem').toMatch(rule.convert?.allTest || '')
    })

    it('should not match on invalid number', () => {
      const rule = handleSpacing()
      expect('-10.5vh').not.toMatch(rule.convert?.allTest || '')
    })

    it('should match when one is valid number', () => {
      const rule = handleSpacing()
      expect('-10.5vh -10.5rem').toMatch(rule.convert?.allTest || '')
    })
  })

  describe('convertHandler', () => {
    it('should convert px to spacing', () => {
      const rule = handleSpacing()
      const text = '10.5px'
      const line = `margin-top: ${text};`
      const result = rule.convert?.convertHandler?.(text, line)

      expect(result).toEqual({
        documentation: 'Convert 10.5px to var(--spacing-x-small)',
        label: '10.5px 👉 var(--spacing-x-small)',
        px: '10.5px',
        pxValue: 10.5,
        rem: '0.656rem',
        remValue: 0.656,
        text: '10.5px',
        type: 'handleSpacing',
        value: 'var(--spacing-x-small)',
      })
    })

    it('should convert rem to spacing', () => {
      const rule = handleSpacing()
      const text = '10.5rem'
      const line = `margin-top: ${text};`
      const result = rule.convert?.convertHandler?.(text, line)

      expect(result).toEqual({
        documentation:
          'Convert 10.5rem to calc(var(--spacing-xx-large) + var(--spacing-xx-large) + var(--spacing-xx-large))',
        label:
          '10.5rem 👉 calc(var(--spacing-xx-large) + var(--spacing-xx-large) + var(--spacing-xx-large))',
        px: '168px',
        pxValue: 168,
        rem: '10.5rem',
        remValue: 10.5,
        text: '10.5rem',
        type: 'handleSpacing',
        value:
          'calc(var(--spacing-xx-large) + var(--spacing-xx-large) + var(--spacing-xx-large))',
      })
    })

    it('should result in var only', () => {
      const rule = handleSpacing()
      const text = '1rem'
      const line = `margin-top: ${text};`
      const result = rule.convert?.convertHandler?.(text, line)

      expect(result).toEqual({
        documentation: 'Convert 1rem to var(--spacing-small)',
        label: '1rem 👉 var(--spacing-small)',
        px: '16px',
        pxValue: 16,
        rem: '1rem',
        remValue: 1,
        text: '1rem',
        type: 'handleSpacing',
        value: 'var(--spacing-small)',
      })
    })
  })
})

describe('hover', () => {
  describe('hoverTest', () => {
    it('should match spacing type', () => {
      const rule = handleSpacing()
      expect('var(--spacing-large)').toMatch(rule.hover?.hoverTest || '')
    })

    it('should match on spacing type with foo', () => {
      const rule = handleSpacing()
      expect('foo var(--spacing-large)').toMatch(
        rule.hover?.hoverTest || ''
      )
    })

    it('should match on several spacing types', () => {
      const rule = handleSpacing()
      expect('calc(var(--spacing-large) + var(--spacing-small))').toMatch(
        rule.hover?.hoverTest || ''
      )
    })

    it('should not match on spacing type with var', () => {
      const rule = handleSpacing()
      expect('var foo(--spacing-large)').not.toMatch(
        rule.hover?.hoverTest || ''
      )
    })

    it('should not match on invalid spacing type', () => {
      const rule = handleSpacing()
      expect('var(--foo-large)').not.toMatch(rule.hover?.hoverTest || '')
    })
  })

  describe('hoverHandler', () => {
    it('should show many spacing types inside calc', () => {
      const rule = handleSpacing()
      const text =
        'calc(var(--spacing-xx-large) + var(--spacing-xx-large) + var(--spacing-xx-large))'
      const line = `margin-top: ${text};`
      const result = rule.hover?.hoverHandler?.(text, line)

      expect(result).toEqual({
        documentation: 'Converted from `10.5`',
        from: 'calc(var(--spacing-xx-large) + var(--spacing-xx-large) + var(--spacing-xx-large))',
        to: '10.5rem (168px)',
        type: 'handleSpacing',
      })
    })

    it('should show a single spacing type', () => {
      const rule = handleSpacing()
      const text = 'var(--spacing-xx-large)'
      const line = `margin-top: ${text};`
      const result = rule.hover?.hoverHandler?.(text, line)

      expect(result).toEqual({
        documentation: 'Converted from `3.5`',
        from: 'var(--spacing-xx-large)',
        to: '3.5rem (56px)',
        type: 'handleSpacing',
      })
    })
  })
})
