import type { CalendarDate } from './persian'
import { gregorianToJdn, jdnToGregorian } from './jdn'

export type HijriMethod = 'civil'

export const HIJRI_METHOD_LABELS: Record<HijriMethod, string> = {
  civil: 'محاسباتی (Civil / Tabular)',
}

export const MIN_HIJRI_DATE: CalendarDate = { year: 1, month: 1, day: 1 }
export const MAX_HIJRI_DATE: CalendarDate = { year: 3274, month: 12, day: 10 }

const ISLAMIC_EPOCH_JDN = 1948440

export function isHijriLeapYear(year: number): boolean {
  return ((11 * year + 14) % 30) < 11
}

export function getHijriDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 0
  if (month === 12) return isHijriLeapYear(year) ? 30 : 29
  return month % 2 === 1 ? 30 : 29
}

function hijriToJdnRaw(date: CalendarDate): number {
  return (
    date.day +
    Math.ceil(29.5 * (date.month - 1)) +
    (date.year - 1) * 354 +
    Math.floor((3 + 11 * date.year) / 30) +
    ISLAMIC_EPOCH_JDN -
    1
  )
}

function jdnToHijriRaw(jdn: number): CalendarDate {
  const year = Math.floor((30 * (jdn - ISLAMIC_EPOCH_JDN) + 10646) / 10631)
  const firstDay = hijriToJdnRaw({ year, month: 1, day: 1 })
  const month = Math.max(
    1,
    Math.min(12, Math.ceil((jdn - (29 + firstDay)) / 29.5) + 1),
  )
  const day = jdn - hijriToJdnRaw({ year, month, day: 1 }) + 1

  return { year, month, day }
}

function compareDates(left: CalendarDate, right: CalendarDate): number {
  if (left.year !== right.year) return left.year - right.year
  if (left.month !== right.month) return left.month - right.month
  return left.day - right.day
}

export function validateHijriDate(date: CalendarDate): string | null {
  if (!Number.isInteger(date.year) || date.year < 1) {
    return 'سال قمری باید عددی بزرگ‌تر از صفر باشد.'
  }

  if (!Number.isInteger(date.month) || date.month < 1 || date.month > 12) {
    return 'ماه قمری باید بین 1 تا 12 باشد.'
  }

  const maxDay = getHijriDaysInMonth(date.year, date.month)
  if (!Number.isInteger(date.day) || date.day < 1 || date.day > maxDay) {
    return `ماه انتخاب‌شده در سال ${date.year} فقط ${maxDay} روز دارد.`
  }

  if (
    compareDates(date, MIN_HIJRI_DATE) < 0 ||
    compareDates(date, MAX_HIJRI_DATE) > 0
  ) {
    return 'بازه فعلی تبدیل قمری از 1/01/01 تا 3274/12/10 پشتیبانی می‌شود.'
  }

  return null
}

export function gregorianToHijri(
  date: CalendarDate,
  adjustment = 0,
): CalendarDate {
  const jdn = gregorianToJdn(date.year, date.month, date.day)
  return jdnToHijriRaw(jdn + adjustment)
}

export function hijriToGregorian(
  date: CalendarDate,
  adjustment = 0,
): CalendarDate {
  const jdn = hijriToJdnRaw(date) - adjustment
  return jdnToGregorian(jdn)
}
