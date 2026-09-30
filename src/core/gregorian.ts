import type { CalendarDate } from './persian'

export function isGregorianLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

export function getGregorianDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 0

  if (month === 2) return isGregorianLeapYear(year) ? 29 : 28
  if ([4, 6, 9, 11].includes(month)) return 30
  return 31
}

export function validateGregorianDate(date: CalendarDate): string | null {
  if (!Number.isInteger(date.year) || date.year < 1 || date.year > 9999) {
    return 'سال میلادی باید عددی بین 1 تا 9999 باشد.'
  }

  if (!Number.isInteger(date.month) || date.month < 1 || date.month > 12) {
    return 'ماه میلادی باید بین 1 تا 12 باشد.'
  }

  const maxDay = getGregorianDaysInMonth(date.year, date.month)
  if (!Number.isInteger(date.day) || date.day < 1 || date.day > maxDay) {
    return `ماه انتخاب‌شده در سال ${date.year} فقط ${maxDay} روز دارد.`
  }

  return null
}
