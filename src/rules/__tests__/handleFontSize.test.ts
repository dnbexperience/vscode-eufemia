import { beforeAll, describe, expect, it, vi } from 'vitest'
import { handleFontSize } from '../handleFontSize'
import { getConfig, loadConfig } from '../../extension/helpers'

vi.mock('vscode', () => {
  const workspace = {
    getConfiguration: () => getConfig(),
  }

  return { workspace }
})

beforeAll(() => {
  loadConfig()
})

describe('convert', () => {
  describe('singleTest', () => {
    it('should match on px number', () => {
      const rule = handleFontSize()
      expect('10.5px').toMatch(rule.convert?.singleTest || '')
    })

    it('should match on rem number', () => {
      const rule = handleFontSize()
      expect('10.5rem').toMatch(rule.convert?.singleTest || '')
    })

    it('should not match on invalid number', () => {
      const rule = handleFontSize()
      expect('10.5vh').not.toMatch(rule.convert?.singleTest || '')
    })
  })

  describe('allTest', () => {
    it('should match on px number', () => {
      const rule = handleFontSize()
      expect('10.5px +10.5px').toMatch(rule.convert?.allTest || '')
    })

    it('should match on rem number', () => {
      const rule = handleFontSize()
      expect('10.5rem +10.5rem').toMatch(rule.convert?.allTest || '')
    })

    it('should not match on invalid number', () => {
      const rule = handleFontSize()
      expect('10.5vh').not.toMatch(rule.convert?.allTest || '')
    })

    it('should match when one is valid number', () => {
      const rule = handleFontSize()
      expect('10.5vh 10.5rem').toMatch(rule.convert?.allTest || '')
    })
  })

  describe('convertCondition', () => {
    it('should match on px value', () => {
      const rule = handleFontSize()
      const line = 'font-size: 10.5px;'
      const result = rule.convert?.convertCondition?.(line)
      expect(result).toBeTruthy()
    })

    it('should match on rem value', () => {
      const rule = handleFontSize()
      const line = 'font-size: 10.5rem;'
      const result = rule.convert?.convertCondition?.(line)
      expect(result).toBeTruthy()
    })

    it('should not match on condition', () => {
      const rule = handleFontSize()
      const line = 'margin-top: 10.5rem;'
      const result = rule.convert?.convertCondition?.(line)
      expect(result).toBeFalsy()
    })
  })

  describe('convertHandler', () => {
    it('should convert px to font-size var', () => {
      const rule = handleFontSize()
      const text = '10.5px'
      const line = `font-size: ${text};`
      const result = rule.convert?.convertHandler?.(text, line)

      expect(result).toEqual({
        documentation: 'Convert `10.5px` to `var(--font-size-x-small)`',
        label: '10.5px 👉 var(--font-size-x-small)',
        text: '10.5px',
        type: 'handleFontSize',
        value: 'var(--font-size-x-small)',
      })
    })

    it('should convert rem to font-size var', () => {
      const rule = handleFontSize()
      const text = '10.5rem'
      const line = `font-size: ${text};`
      const result = rule.convert?.convertHandler?.(text, line)

      expect(result).toEqual({
        documentation: 'Convert `10.5rem` to `var(--font-size-xx-large)`',
        label: '10.5rem 👉 var(--font-size-xx-large)',
        text: '10.5rem',
        type: 'handleFontSize',
        value: 'var(--font-size-xx-large)',
      })
    })
  })
})

describe('hover', () => {
  describe('hoverTest', () => {
    it('should match font-size type', () => {
      const rule = handleFontSize()
      expect('var(--font-size-large)').toMatch(rule.hover?.hoverTest || '')
    })

    it('should match on font-size type with foo', () => {
      const rule = handleFontSize()
      expect('foo var(--font-size-large)').toMatch(
        rule.hover?.hoverTest || ''
      )
    })

    it('should match on several font-size types', () => {
      const rule = handleFontSize()
      expect(
        'calc(var(--font-size-large) + var(--font-size-small))'
      ).toMatch(rule.hover?.hoverTest || '')
    })

    it('should not match on font-size type with var', () => {
      const rule = handleFontSize()
      expect('var foo(--font-size-large)').not.toMatch(
        rule.hover?.hoverTest || ''
      )
    })

    it('should not match on invalid font-size type', () => {
      const rule = handleFontSize()
      expect('var(--foo-large)').not.toMatch(rule.hover?.hoverTest || '')
    })
  })

  describe('hoverCondition', () => {
    it('should match on px value', () => {
      const rule = handleFontSize()
      const line = 'font-size: 10.5px;'
      const result = rule.hover?.hoverCondition?.(line)
      expect(result).toBeTruthy()
    })

    it('should match on rem value', () => {
      const rule = handleFontSize()
      const line = 'font-size: 10.5rem;'
      const result = rule.hover?.hoverCondition?.(line)
      expect(result).toBeTruthy()
    })

    it('should match on CSS var', () => {
      const rule = handleFontSize()
      const line = '--font-size-xx-large: 10.5rem;'
      const result = rule.hover?.hoverCondition?.(line)
      expect(result).toBeTruthy()
    })

    it('should not match on condition', () => {
      const rule = handleFontSize()
      const line = 'margin-top: 10.5rem;'
      const result = rule.hover?.hoverCondition?.(line)
      expect(result).toBeFalsy()
    })
  })

  describe('hoverHandler', () => {
    it('should show font-size in rem and px', () => {
      const rule = handleFontSize()
      const text = 'var(--font-size-xx-large)'
      const line = `font-size: ${text};`
      const result = rule.hover?.hoverHandler?.(text, line)

      expect(result).toEqual({
        documentation: 'Equivalent to `3`',
        from: 'var(--font-size-xx-large)',
        to: '3rem (48px)',
        type: 'handleFontSize',
      })
    })
  })
})
