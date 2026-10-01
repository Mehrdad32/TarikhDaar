import { describe, expect, it } from 'vitest'
import {
  getHijriDaysInMonth,
  gregorianToHijri,
  hijriToGregorian,
  isHijriLeapYear,
  validateHijriDate,
} from './hijri'

describe('Civil Hijri conversion', () => {
  it('maps the civil epoch correctly', () => {
    expect(gregorianToHijri({ year: 622, month: 7, day: 19 })).toEqual({
      year: 1,
      month: 1,
      day: 1,
    })
  })

  it('converts the product reference date', () => {
    expect(gregorianToHijri({ year: 1991, month: 1, day: 2 })).toEqual({
      year: 1411,
      month: 6,
      day: 15,
    })
  })

  it('round-trips Hijri dates', () => {
    const hijri = { year: 1411, month: 6, day: 15 }
    const gregorian = hijriToGregorian(hijri)
    expect(gregorian).toEqual({ year: 1991, month: 1, day: 2 })
    expect(gregorianToHijri(gregorian)).toEqual(hijri)
  })

  it('applies day adjustment symmetrically', () => {
    const gregorian = { year: 1991, month: 1, day: 2 }
    const adjusted = gregorianToHijri(gregorian, 1)

    expect(adjusted).toEqual({ year: 1411, month: 6, day: 16 })
    expect(hijriToGregorian(adjusted, 1)).toEqual(gregorian)
  })

  it('handles leap-year month length', () => {
    expect(isHijriLeapYear(1445)).toBe(true)
    expect(getHijriDaysInMonth(1445, 12)).toBe(30)
  })

  it('rejects impossible dates', () => {
    expect(validateHijriDate({ year: 1446, month: 2, day: 30 })).not.toBeNull()
  })
})
