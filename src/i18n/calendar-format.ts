import type { CalendarDate } from '../core/persian'
import { getGregorianWeekdayIndex } from '../core/date-utils'
import { localizeDigits, type DigitSystem } from './numerals'

export const gregorianMonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

export const persianMonthNames = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
] as const

export const hijriMonthNames = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
] as const

const gregorianWeekdayNames = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const

const persianWeekdayNames = [
  'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه',
] as const

const arabicWeekdayNames = [
  'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت',
] as const

export type FormattableCalendar = 'gregorian' | 'persian' | 'hijri'

export function calendarDigitSystem(calendar: FormattableCalendar): DigitSystem {
  if (calendar === 'persian') return 'persian'
  if (calendar === 'hijri') return 'arabic'
  return 'latin'
}

export function formatNumericDate(
  date: CalendarDate,
  calendar: FormattableCalendar,
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

export function formatHijriLong(date: CalendarDate): string {
  const raw = `${date.day} ${hijriMonthNames[date.month - 1]} ${date.year}`
  return localizeDigits(raw, 'arabic')
}

export function formatWeekday(
  gregorianDate: CalendarDate,
  calendar: FormattableCalendar,
): string {
  const weekdayIndex = getGregorianWeekdayIndex(gregorianDate)

  if (calendar === 'persian') return persianWeekdayNames[weekdayIndex]
  if (calendar === 'hijri') return arabicWeekdayNames[weekdayIndex]
  return gregorianWeekdayNames[weekdayIndex]
}
