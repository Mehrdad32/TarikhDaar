import { describe, expect, it } from 'vitest'
import { getGregorianWeekdayIndex, getTodayGregorian } from './date-utils'

describe('date utilities', () => {
  it('extracts the local device calendar date', () => {
    const date = new Date(2026, 8, 30, 12, 30, 0)

    expect(getTodayGregorian(date)).toEqual({
      year: 2026,
      month: 9,
      day: 30,
    })
  })

  it('calculates Wednesday for 2 January 1991', () => {
    expect(getGregorianWeekdayIndex({ year: 1991, month: 1, day: 2 })).toBe(3)
  })

  it('calculates Monday for 1 January 2024', () => {
    expect(getGregorianWeekdayIndex({ year: 2024, month: 1, day: 1 })).toBe(1)
  })
})
