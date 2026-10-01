import { describe, expect, it } from 'vitest'
import {
  getPersianDaysInMonth,
  gregorianToPersian,
  isPersianLeapYear,
  persianToGregorian,
  validatePersianDate,
} from './persian'

describe('Persian/Gregorian conversion', () => {
  it('converts 2 January 1991 to 12 Dey 1369', () => {
    expect(gregorianToPersian({ year: 1991, month: 1, day: 2 })).toEqual({ year: 1369, month: 10, day: 12 })
  })

  it('converts 12 Dey 1369 back to 2 January 1991', () => {
    expect(persianToGregorian({ year: 1369, month: 10, day: 12 })).toEqual({ year: 1991, month: 1, day: 2 })
  })

  it('converts Persian new year 1405', () => {
    expect(persianToGregorian({ year: 1405, month: 1, day: 1 })).toEqual({ year: 2026, month: 3, day: 21 })
  })
})

describe('Persian date validation', () => {
  it('recognizes leap years correctly', () => {
    expect(isPersianLeapYear(1399)).toBe(true)
    expect(isPersianLeapYear(1400)).toBe(false)
  })

  it('returns the right Esfand length', () => {
    expect(getPersianDaysInMonth(1399, 12)).toBe(30)
    expect(getPersianDaysInMonth(1400, 12)).toBe(29)
  })

  it('rejects impossible dates with a human-readable message', () => {
    expect(validatePersianDate({ year: 1400, month: 12, day: 30 })).toBe('ماه انتخاب‌شده در سال 1400 فقط 29 روز دارد.')
  })

  it('enforces the round-trip-safe upper boundary', () => {
    expect(validatePersianDate({ year: 3177, month: 10, day: 11 })).toBeNull()
    expect(validatePersianDate({ year: 3177, month: 10, day: 12 })).toBe(
      'بازه فعلی تبدیل خورشیدی تا 3177/10/11 پشتیبانی می‌شود.',
    )
  })

  it('accepts the product reference date', () => {
    expect(validatePersianDate({ year: 1369, month: 10, day: 12 })).toBeNull()
  })
})
