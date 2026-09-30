import { describe, expect, it } from 'vitest'
import { gregorianToPersian, persianToGregorian } from './persian'

describe('Persian/Gregorian conversion', () => {
  it('converts 2 January 1991 to 12 Dey 1369', () => {
    expect(gregorianToPersian({ year: 1991, month: 1, day: 2 })).toEqual({ year: 1369, month: 10, day: 12 })
  })

  it('converts 12 Dey 1369 back to 2 January 1991', () => {
    expect(persianToGregorian({ year: 1369, month: 10, day: 12 })).toEqual({ year: 1991, month: 1, day: 2 })
  })

  it('converts Persian new year 1405', () => {
    expect(persianToGregorian({ year: 1405, month: 1, day: 1 })).toEqual({ year: 2026, month: 3, day: 21 })
  })
})
