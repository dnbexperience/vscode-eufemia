import { beforeAll, describe, expect, it, vi } from 'vitest'
import {
  getConfig,
  loadConfig,
  matchLineWhen,
  cleanZero,
  isSpacing,
  findNearestType,
} from '../helpers'

vi.mock('vscode', () => {
  const workspace = {
    getConfiguration: () => getConfig(),
  }

  return { workspace }
})

beforeAll(() => {
  loadConfig()
})

describe('matchLineWhen', () => {
  it('should match on px', () => {
    const match = matchLineWhen('12.5px')
    expect(match).toBeTruthy()
    expect(match).toEqual(['12.5px'])
  })

  it('should match on rem', () => {
    const match = matchLineWhen('12.5rem')
    expect(match).toBeTruthy()
    expect(match).toEqual(['12.5rem'])
  })

  it('should match wtih leading zero', () => {
    const match = matchLineWhen('0.5rem')
    expect(match).toBeTruthy()
    expect(match).toEqual(['0.5rem'])
  })

  it('should match on var', () => {
    const match = matchLineWhen('var(--spacing-large)')
    expect(match).toBeTruthy()
    expect(match).toEqual(['var(--spacing-large)'])
  })

  it('should not match on var only', () => {
    const match = matchLineWhen('var')
    expect(match).toBeFalsy()
  })

  it('should not match on calc only', () => {
    const match = matchLineWhen('calc')
    expect(match).toBeFalsy()
  })

  it('should match on calc', () => {
    const match = matchLineWhen(
      "margin-bottom: ${calc('small', 'large')};"
    )
    expect(match).toBeTruthy()
    expect(match).toEqual(["calc('small', 'large')"])
  })

  it('should not match when comment', () => {
    expect(matchLineWhen('// 12.5px')).toBeFalsy()
    expect(matchLineWhen('// 12.5rem')).toBeFalsy()
    expect(matchLineWhen('// 0.5rem')).toBeFalsy()
    expect(matchLineWhen('// var(--spacing-large)')).toBeFalsy()
    expect(
      matchLineWhen("// margin-bottom: ${calc('small', 'large')};")
    ).toBeFalsy()
  })

  it('should not match when no number was given', () => {
    const match = matchLineWhen('document.body.removeListener')
    expect(match).toBeFalsy()
  })
})

describe('isSpacing', () => {
  it('should return true on condition', () => {
    expect(isSpacing('margin')).toBeTruthy()
    expect(isSpacing('padding')).toBeTruthy()
    expect(isSpacing('top')).toBeTruthy()
    expect(isSpacing('bottom')).toBeTruthy()
    expect(isSpacing('left')).toBeTruthy()
    expect(isSpacing('right')).toBeTruthy()
    expect(isSpacing('inset')).toBeTruthy()
  })
})

describe('cleanZero', () => {
  it('should remove leading zero', () => {
    expect(cleanZero(0.5)).toBe('.5')
  })
})

describe('findNearestType', () => {
  const list = { small: '8', basis: '16', large: '24' }

  it('should find large', () => {
    expect(findNearestType(17, list)).toBe('large')
  })

  it('should find small', () => {
    expect(findNearestType(7, list)).toBe('small')
  })

  it('should find basis', () => {
    expect(findNearestType(15, list)).toBe('basis')
  })

  it('should find large', () => {
    expect(findNearestType(100, list)).toBe('large')
  })

  it('should return basis if empty list was given', () => {
    expect(findNearestType(1, {})).toBe('basis')
  })
})
