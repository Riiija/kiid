import { describe, expect, it } from 'vitest'
import { formatKidCoins, getProgressPercent } from './formatters'

describe('formatKidCoins', () => {
  it('formats KidCoins for French users', () => {
    expect(formatKidCoins(125)).toBe('125 KidCoins')
  })

  it('can show positive and negative signs', () => {
    expect(formatKidCoins(20, true)).toBe('+20 KidCoins')
    expect(formatKidCoins(-10, true)).toBe('-10 KidCoins')
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
