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
    expect(matchLineWhen('12.5px')).toBeTruthy()
  })

  it('should match on rem', () => {
    expect(matchLineWhen('12.5rem')).toBeTruthy()
  })

  it('should match on var', () => {
    expect(matchLineWhen('var(--spacing-large)')).toBeTruthy()
  })

  it('should not match on var only', () => {
    expect(matchLineWhen('var')).toBeFalsy()
  })

  it('should not match on calc only', () => {
    expect(matchLineWhen('calc')).toBeFalsy()
  })

  it('should match on calc', () => {
    expect(
      matchLineWhen("margin-bottom: ${calc('small', 'large')};")
    ).toBeTruthy()
  })

  it('should not match when no number was given', () => {
    expect(matchLineWhen('document.body.removeListener')).toBeFalsy()
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
