import { describe, expect, it } from 'vitest'
import { addGregorianDays, gregorianToJdn, jdnToGregorian } from './jdn'

describe('Julian day helpers', () => {
  it('round-trips Gregorian dates', () => {
    const date = { year: 1991, month: 1, day: 2 }
    expect(jdnToGregorian(gregorianToJdn(date.year, date.month, date.day))).toEqual(date)
  })

  it('adds days across month and year boundaries', () => {
    expect(addGregorianDays({ year: 2024, month: 12, day: 31 }, 1)).toEqual({
      year: 2025,
      month: 1,
      day: 1,
    })
  })
})
