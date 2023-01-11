import { beforeAll, describe, expect, it, vi } from 'vitest'
import { handleValues } from '../handleValues'
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
      const rule = handleValues()
      expect('-168px').toMatch(rule.convert?.singleTest || '')
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
      expect('-168px +10.5px').toMatch(rule.convert?.allTest || '')
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
      const text = '-168px'
      const line = `margin-top: ${text};`
      const result = rule.convert?.convertHandler?.(text, line)

      expect(result).toEqual({
        documentation: 'Convert `-168px` to `-10.5rem`',
        label: '-168px 👉 -10.5rem',
        px: '-168px',
        pxValue: -168,
        rem: '-10.5rem',
        remValue: -10.5,
        text: '-168px',
        type: 'handleValues',
        value: '-10.5rem',
      })
    })

    it('should convert rem to px', () => {
      const rule = handleValues()
      const text = '-10.5rem'
      const line = `margin-top: ${text};`
      const result = rule.convert?.convertHandler?.(text, line)

      expect(result).toEqual({
        documentation: 'Convert `-10.5rem` to `-168px`',
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
      expect('-168px').toMatch(rule.hover?.hoverTest || '')
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

    it('should not match when comment', () => {
      const rule = handleValues()
      expect('// -10.5rem').not.toMatch(rule.hover?.hoverTest || '')
    })
  })

  describe('hoverHandler', () => {
    it('should show px to rem', () => {
      const rule = handleValues()
      const text = '-168px'
      const result = rule.hover?.hoverHandler?.(text)

      expect(result).toEqual({
        documentation: 'Equivalent to `-10.5rem`',
        from: '-168px',
        to: '-10.5rem',
        type: 'handleValues',
      })
    })

    it('should show rem to px', () => {
      const rule = handleValues()
      const text = '-10.5rem'
      const result = rule.hover?.hoverHandler?.(text)

      expect(result).toEqual({
        documentation: 'Equivalent to `-168px`',
        from: '-10.5rem',
        to: '-168px',
        type: 'handleValues',
      })
    })

    it('should show rem to px with leading zero', () => {
      const rule = handleValues()
      const text = '-0.5rem'
      const result = rule.hover?.hoverHandler?.(text)

      expect(result).toEqual({
        documentation: 'Equivalent to `-8px`',
        from: '-0.5rem',
        to: '-8px',
        type: 'handleValues',
      })
    })

    it('should handle invalid values', () => {
      {
        const rule = handleValues()
        const text = `'-6rem'`
        const result = rule.hover?.hoverHandler?.(text)

        expect(result).toEqual({
          documentation: 'Equivalent to `-96px`',
          from: '-6rem',
          to: '-96px',
          type: 'handleValues',
        })
      }

      {
        const rule = handleValues()
        const text = `(-96px)`
        const result = rule.hover?.hoverHandler?.(text)

        expect(result).toEqual({
          documentation: 'Equivalent to `-6rem`',
          from: '-96px',
          to: '-6rem',
          type: 'handleValues',
        })
      }

      {
        const rule = handleValues()
        const text = 'x'
        const result = rule.hover?.hoverHandler?.(text)

        expect(result).toEqual(null)
      }
    })

    it('should not include comments (//)', () => {
      const rule = handleValues()
      const text = '-10.5rem // -168px'
      const result = rule.hover?.hoverHandler?.(text)

      expect(result).toEqual({
        documentation: 'Equivalent to `-168px`',
        from: '-10.5rem',
        to: '-168px',
        type: 'handleValues',
      })
    })
  })
})
