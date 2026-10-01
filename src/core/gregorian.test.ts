import { describe, expect, it } from 'vitest'
import {
  getGregorianDaysInMonth,
  isGregorianLeapYear,
  validateGregorianDate,
} from './gregorian'

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
    expect(validateGregorianDate({ year: 2025, month: 2, day: 31 })).toBe(
      'ماه انتخاب‌شده در سال 2025 فقط 28 روز دارد.',
    )
  })

  it('rejects years that used to crash Persian conversion', () => {
    expect(validateGregorianDate({ year: 1, month: 1, day: 1 })).toBe(
      'بازه فعلی تبدیل میلادی از 622/03/22 تا 3798/12/31 پشتیبانی می‌شود.',
    )
  })

  it('enforces the exact lower supported boundary', () => {
    expect(validateGregorianDate({ year: 622, month: 3, day: 21 })).not.toBeNull()
    expect(validateGregorianDate({ year: 622, month: 3, day: 22 })).toBeNull()
  })

  it('enforces the upper supported boundary', () => {
    expect(validateGregorianDate({ year: 3798, month: 12, day: 31 })).toBeNull()
    expect(validateGregorianDate({ year: 3799, month: 1, day: 1 })).not.toBeNull()
  })

  it('accepts the product reference date', () => {
    expect(validateGregorianDate({ year: 1991, month: 1, day: 2 })).toBeNull()
  })
})
