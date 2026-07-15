import { describe, expect, it } from 'vitest'
import { formatKidCoins, getProgressPercent } from './formatters'

describe('formatKidCoins', () => {
  it('formats euro amounts for French users', () => {
    expect(formatKidCoins(125)).toBe('125 €')
  })

  it('can show positive and negative signs', () => {
    expect(formatKidCoins(20, true)).toBe('+20 €')
    expect(formatKidCoins(-10, true)).toBe('-10 €')
  })
})

describe('getProgressPercent', () => {
  it('caps progress at 100 percent', () => {
    expect(getProgressPercent(140, 100)).toBe(100)
  })

  it('returns 0 for an invalid target', () => {
    expect(getProgressPercent(10, 0)).toBe(0)
  })
})
