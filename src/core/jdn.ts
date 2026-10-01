import type { CalendarDate } from './persian'

function div(a: number, b: number): number {
  return Math.trunc(a / b)
}

function mod(a: number, b: number): number {
  return a - Math.trunc(a / b) * b
}

export function gregorianToJdn(gy: number, gm: number, gd: number): number {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
  d += div(153 * mod(gm + 9, 12) + 2, 5)
  d += gd - 34840408
  d -= div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4)
  return d + 752
}

export function jdnToGregorian(jdn: number): CalendarDate {
  let j = 4 * jdn + 139361631
  j += div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
  const i = div(mod(j, 1461), 4) * 5 + 308
  const gd = div(mod(i, 153), 5) + 1
  const gm = mod(div(i, 153), 12) + 1
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6)
  return { year: gy, month: gm, day: gd }
}

export function addGregorianDays(date: CalendarDate, days: number): CalendarDate {
  return jdnToGregorian(gregorianToJdn(date.year, date.month, date.day) + days)
}
