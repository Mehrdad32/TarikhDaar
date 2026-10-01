export interface CalendarDate {
  year: number
  month: number
  day: number
}

function div(a: number, b: number): number {
  return Math.trunc(a / b)
}

function mod(a: number, b: number): number {
  return a - Math.trunc(a / b) * b
}

function jalCal(jy: number): { leap: number; gy: number; march: number } {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178]
  const bl = breaks.length
  const gy = jy + 621
  let leapJ = -14
  let jp = breaks[0]
  let jm = 0
  let jump = 0

  if (jy < jp || jy >= breaks[bl - 1]) {
    throw new RangeError(`Persian year ${jy} is outside the supported range.`)
  }

  for (let i = 1; i < bl; i += 1) {
    jm = breaks[i]
    jump = jm - jp
    if (jy < jm) break
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4)
    jp = jm
  }

  let n = jy - jp
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150
  const march = 20 + leapJ - leapG

  if (jump - n < 6) {
    n = n - jump + div(jump + 4, 33) * 33
  }

  let leap = mod(mod(n + 1, 33) - 1, 4)
  if (leap === -1) leap = 4

  return { leap, gy, march }
}

function gregorianToJdn(gy: number, gm: number, gd: number): number {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
  d += div(153 * mod(gm + 9, 12) + 2, 5)
  d += gd - 34840408
  d -= div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4)
  return d + 752
}

function jdnToGregorian(jdn: number): CalendarDate {
  let j = 4 * jdn + 139361631
  j += div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
  const i = div(mod(j, 1461), 4) * 5 + 308
  const gd = div(mod(i, 153), 5) + 1
  const gm = mod(div(i, 153), 12) + 1
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6)
  return { year: gy, month: gm, day: gd }
}

function persianToJdn(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy)
  return gregorianToJdn(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
}

function jdnToPersian(jdn: number): CalendarDate {
  const g = jdnToGregorian(jdn)
  let jy = g.year - 621
  const r = jalCal(jy)
  const jdn1f = gregorianToJdn(g.year, 3, r.march)
  let k = jdn - jdn1f
  let jm: number
  let jd: number

  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + div(k, 31)
      jd = mod(k, 31) + 1
      return { year: jy, month: jm, day: jd }
    }
    k -= 186
  } else {
    jy -= 1
    k += 179
    if (r.leap === 1) k += 1
  }

  jm = 7 + div(k, 30)
  jd = mod(k, 30) + 1
  return { year: jy, month: jm, day: jd }
}

export function isPersianLeapYear(year: number): boolean {
  if (!Number.isInteger(year) || year < 1 || year > 3177) return false
  return jalCal(year).leap === 0
}

export function getPersianDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 0
  if (month <= 6) return 31
  if (month <= 11) return 30
  return isPersianLeapYear(year) ? 30 : 29
}

export const MAX_ROUND_TRIP_PERSIAN_DATE: CalendarDate = {
  year: 3177,
  month: 10,
  day: 11,
}

export function validatePersianDate(date: CalendarDate): string | null {
  if (!Number.isInteger(date.year) || date.year < 1 || date.year > 3177) {
    return 'سال خورشیدی باید عددی بین 1 تا 3177 باشد.'
  }

  if (!Number.isInteger(date.month) || date.month < 1 || date.month > 12) {
    return 'ماه خورشیدی باید بین 1 تا 12 باشد.'
  }

  const maxDay = getPersianDaysInMonth(date.year, date.month)
  if (!Number.isInteger(date.day) || date.day < 1 || date.day > maxDay) {
    return `ماه انتخاب‌شده در سال ${date.year} فقط ${maxDay} روز دارد.`
  }

  if (
    date.year === MAX_ROUND_TRIP_PERSIAN_DATE.year &&
    (
      date.month > MAX_ROUND_TRIP_PERSIAN_DATE.month ||
      (
        date.month === MAX_ROUND_TRIP_PERSIAN_DATE.month &&
        date.day > MAX_ROUND_TRIP_PERSIAN_DATE.day
      )
    )
  ) {
    return 'بازه فعلی تبدیل خورشیدی تا 3177/10/11 پشتیبانی می‌شود.'
  }

  return null
}

export function gregorianToPersian(date: CalendarDate): CalendarDate {
  return jdnToPersian(gregorianToJdn(date.year, date.month, date.day))
}

export function persianToGregorian(date: CalendarDate): CalendarDate {
  return jdnToGregorian(persianToJdn(date.year, date.month, date.day))
}
