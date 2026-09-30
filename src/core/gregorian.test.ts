import { describe, expect, it } from 'vitest'
import { getGregorianDaysInMonth, isGregorianLeapYear, validateGregorianDate } from './gregorian'

describe('Gregorian date validation', () => {
  it('recognizes leap years correctly', () => {
    expect(isGregorianLeapYear(2000)).toBe(true)
    expect(isGregorianLeapYear(1900)).toBe(false)
    expect(isGregorianLeapYear(2024)).toBe(true)
  })

  it('returns the right February length', () => {
    expect(getGregorianDaysInMonth(2024, 2)).toBe(29)
    expect(getGregorianDaysInMonth(2025, 2)).toBe(28)
  })

  it('rejects impossible dates with a human-readable message', () => {
    expect(validateGregorianDate({ year: 2025, month: 2, day: 31 })).toBe('ماه انتخاب‌شده در سال 2025 فقط 28 روز دارد.')
  })

  it('accepts the product reference date', () => {
    expect(validateGregorianDate({ year: 1991, month: 1, day: 2 })).toBeNull()
  })
})
