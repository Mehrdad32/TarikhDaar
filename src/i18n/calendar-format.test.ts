import { describe, expect, it } from 'vitest'
import {
  calendarDigitSystem,
  formatGregorianLong,
  formatHijriLong,
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

  it('formats Hijri dates with Arabic text and Arabic-Indic digits', () => {
    const date = { year: 1411, month: 6, day: 15 }
    expect(formatHijriLong(date)).toBe('١٥ جمادى الآخرة ١٤١١')
    expect(formatNumericDate(date, 'hijri')).toBe('١٤١١/٠٦/١٥')
  })

  it('formats weekday names for each calendar language', () => {
    const date = { year: 1991, month: 1, day: 2 }

    expect(formatWeekday(date, 'gregorian')).toBe('Wednesday')
    expect(formatWeekday(date, 'persian')).toBe('چهارشنبه')
    expect(formatWeekday(date, 'hijri')).toBe('الأربعاء')
  })

  it('reserves Arabic-Indic digits for Hijri dates', () => {
    expect(calendarDigitSystem('hijri')).toBe('arabic')
  })
})
