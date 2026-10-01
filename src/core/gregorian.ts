import type { CalendarDate } from './persian'

export const MIN_GREGORIAN_DATE: CalendarDate = { year: 622, month: 3, day: 22 }
export const MAX_GREGORIAN_DATE: CalendarDate = { year: 3798, month: 12, day: 31 }

export function isGregorianLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

export function getGregorianDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 0

  if (month === 2) return isGregorianLeapYear(year) ? 29 : 28
  if ([4, 6, 9, 11].includes(month)) return 30
  return 31
}

function compareDates(left: CalendarDate, right: CalendarDate): number {
  if (left.year !== right.year) return left.year - right.year
  if (left.month !== right.month) return left.month - right.month
  return left.day - right.day
}

export function validateGregorianDate(date: CalendarDate): string | null {
  if (!Number.isInteger(date.year)) {
    return 'سال میلادی را به‌صورت عدد وارد کنید.'
  }

  if (!Number.isInteger(date.month) || date.month < 1 || date.month > 12) {
    return 'ماه میلادی باید بین 1 تا 12 باشد.'
  }

  const maxDay = getGregorianDaysInMonth(date.year, date.month)
  if (!Number.isInteger(date.day) || date.day < 1 || date.day > maxDay) {
    return `ماه انتخاب‌شده در سال ${date.year} فقط ${maxDay} روز دارد.`
  }

  if (
    compareDates(date, MIN_GREGORIAN_DATE) < 0 ||
    compareDates(date, MAX_GREGORIAN_DATE) > 0
  ) {
    return 'بازه فعلی تبدیل میلادی از 622/03/22 تا 3798/12/31 پشتیبانی می‌شود.'
  }

  return null
}
