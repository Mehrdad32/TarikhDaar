import type { CalendarDate } from '../core/persian'
import { localizeDigits, type DigitSystem } from './numerals'

export const gregorianMonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

export const persianMonthNames = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
] as const

export function calendarDigitSystem(calendar: 'gregorian' | 'persian' | 'hijri'): DigitSystem {
  if (calendar === 'persian') return 'persian'
  if (calendar === 'hijri') return 'arabic'
  return 'latin'
}

export function formatNumericDate(
  date: CalendarDate,
  calendar: 'gregorian' | 'persian' | 'hijri',
): string {
  const raw = [
    String(date.year),
    String(date.month).padStart(2, '0'),
    String(date.day).padStart(2, '0'),
  ].join('/')

  return localizeDigits(raw, calendarDigitSystem(calendar))
}

export function formatGregorianLong(date: CalendarDate): string {
  return `${date.day} ${gregorianMonthNames[date.month - 1]} ${date.year}`
}

export function formatPersianLong(date: CalendarDate): string {
  const raw = `${date.day} ${persianMonthNames[date.month - 1]} ${date.year}`
  return localizeDigits(raw, 'persian')
}
