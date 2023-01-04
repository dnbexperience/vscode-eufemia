import { readFileSync } from 'fs'
import { resolve } from 'path'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { handleLineHeight } from '../handleLineHeight'
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
      const rule = handleLineHeight()
      expect('10.5px').toMatch(rule.convert?.singleTest || '')
    })

    it('should match on rem number', () => {
      const rule = handleLineHeight()
      expect('10.5rem').toMatch(rule.convert?.singleTest || '')
    })

    it('should not match on invalid number', () => {
      const rule = handleLineHeight()
      expect('10.5vh').not.toMatch(rule.convert?.singleTest || '')
    })
  })

  describe('allTest', () => {
    it('should match on px number', () => {
      const rule = handleLineHeight()
      expect('10.5px +10.5px').toMatch(rule.convert?.allTest || '')
    })

    it('should match on rem number', () => {
      const rule = handleLineHeight()
      expect('10.5rem +10.5rem').toMatch(rule.convert?.allTest || '')
    })

    it('should not match on invalid number', () => {
      const rule = handleLineHeight()
      expect('10.5vh').not.toMatch(rule.convert?.allTest || '')
    })

    it('should match when one is valid number', () => {
      const rule = handleLineHeight()
      expect('10.5vh 10.5rem').toMatch(rule.convert?.allTest || '')
    })
  })

  describe('convertCondition', () => {
    it('should match on px value', () => {
      const rule = handleLineHeight()
      const line = 'line-height: 10.5px;'
      const result = rule.convert?.convertCondition?.(line)
      expect(result).toBeTruthy()
    })

    it('should match on rem value', () => {
      const rule = handleLineHeight()
      const line = 'line-height: 10.5rem;'
      const result = rule.convert?.convertCondition?.(line)
      expect(result).toBeTruthy()
    })

    it('should not match on condition', () => {
      const rule = handleLineHeight()
      const line = 'margin-top: 10.5rem;'
      const result = rule.convert?.convertCondition?.(line)
      expect(result).toBeFalsy()
    })
  })

  describe('convertHandler', () => {
    it('should convert px to line-height var', () => {
      const rule = handleLineHeight()
      const text = '10.5px'
      const line = `line-height: ${text};`
      const result = rule.convert?.convertHandler?.(text, line)

      expect(result).toEqual({
        documentation:
          'Convert `10.5px` to `var(--line-height-xx-small--em)`',
        label: '10.5px 👉 var(--line-height-xx-small--em)',
        text: '10.5px',
        type: 'handleLineHeight',
        value: 'var(--line-height-xx-small--em)',
      })
    })

    it('should convert rem to line-height var', () => {
      const rule = handleLineHeight()
      const text = '10.5rem'
      const line = `line-height: ${text};`
      const result = rule.convert?.convertHandler?.(text, line)

      expect(result).toEqual({
        documentation: 'Convert `10.5rem` to `var(--line-height-x-large)`',
        label: '10.5rem 👉 var(--line-height-x-large)',
        text: '10.5rem',
        type: 'handleLineHeight',
        value: 'var(--line-height-x-large)',
      })
    })
  })
})

describe('hover', () => {
  describe('hoverTest', () => {
    it('should match line-height type', () => {
      const rule = handleLineHeight()
      expect('var(--line-height-large)').toMatch(
        rule.hover?.hoverTest || ''
      )
    })

    it('should match on line-height type with foo', () => {
      const rule = handleLineHeight()
      expect('foo var(--line-height-large)').toMatch(
        rule.hover?.hoverTest || ''
      )
    })

    it('should match on several line-height types', () => {
      const rule = handleLineHeight()
      expect(
        'calc(var(--line-height-large) + var(--line-height-small))'
      ).toMatch(rule.hover?.hoverTest || '')
    })

    it('should not match on line-height type with var', () => {
      const rule = handleLineHeight()
      expect('var foo(--line-height-large)').not.toMatch(
        rule.hover?.hoverTest || ''
      )
    })

    it('should not match on invalid line-height type', () => {
      const rule = handleLineHeight()
      expect('var(--foo-large)').not.toMatch(rule.hover?.hoverTest || '')
    })
  })

  describe('hoverCondition', () => {
    it('should match on px value', () => {
      const rule = handleLineHeight()
      const line = 'line-height: 10.5px;'
      const result = rule.hover?.hoverCondition?.(line)
      expect(result).toBeTruthy()
    })

    it('should match on rem value', () => {
      const rule = handleLineHeight()
      const line = 'line-height: 10.5rem;'
      const result = rule.hover?.hoverCondition?.(line)
      expect(result).toBeTruthy()
    })

    it('should not match on condition', () => {
      const rule = handleLineHeight()
      const line = 'margin-top: 10.5rem;'
      const result = rule.hover?.hoverCondition?.(line)
      expect(result).toBeFalsy()
    })
  })

  describe('hoverHandler', () => {
    it('should show line-height in rem and px', () => {
      const rule = handleLineHeight()
      const text = 'var(--line-height-large)'
      const line = `line-height: ${text};`
      const result = rule.hover?.hoverHandler?.(text, line)

      expect(result).toEqual({
        documentation: 'Equivalent to `2.5`',
        from: 'var(--line-height-large)',
        to: '2.5rem (40px)',
        type: 'handleLineHeight',
      })
    })
  })
})
