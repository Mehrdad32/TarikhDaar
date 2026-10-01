import { describe, expect, it } from 'vitest'
import {
  calendarDigitSystem,
  formatGregorianLong,
  formatNumericDate,
  formatPersianLong,
  formatWeekday,
} from './calendar-format'

describe('calendar-aware formatting', () => {
  it('formats Persian dates with Persian digits', () => {
    const date = { year: 1369, month: 10, day: 12 }
    expect(formatPersianLong(date)).toBe('۱۲ دی ۱۳۶۹')
    expect(formatNumericDate(date, 'persian')).toBe('۱۳۶۹/۱۰/۱۲')
  })

  it('formats Gregorian dates with Latin digits', () => {
    const date = { year: 1991, month: 1, day: 2 }
    expect(formatGregorianLong(date)).toBe('2 January 1991')
    expect(formatNumericDate(date, 'gregorian')).toBe('1991/01/02')
  })

  it('formats weekday names for the target calendar language', () => {
    const date = { year: 1991, month: 1, day: 2 }

    expect(formatWeekday(date, 'gregorian')).toBe('Wednesday')
    expect(formatWeekday(date, 'persian')).toBe('چهارشنبه')
  })

  it('reserves Arabic-Indic digits for Hijri dates', () => {
    expect(calendarDigitSystem('hijri')).toBe('arabic')
    expect(formatNumericDate({ year: 1411, month: 6, day: 16 }, 'hijri')).toBe('١٤١١/٠٦/١٦')
  })
})
