import { describe, expect, it } from 'vitest'
import {
  localizeDigits,
  normalizeDigits,
  parseLocalizedInteger,
  sanitizeDateField,
} from './numerals'

describe('localized numeral handling', () => {
  it('normalizes Persian and Arabic-Indic digits to Latin', () => {
    expect(normalizeDigits('۱۴۰۵/٠٧/03')).toBe('1405/07/03')
  })

  it('localizes Latin digits to Persian digits', () => {
    expect(localizeDigits('1369/10/12', 'persian')).toBe('۱۳۶۹/۱۰/۱۲')
  })

  it('localizes Latin digits to Arabic-Indic digits', () => {
    expect(localizeDigits('1411/06/16', 'arabic')).toBe('١٤١١/٠٦/١٦')
  })

  it('keeps Gregorian output in Latin digits', () => {
    expect(localizeDigits('1991/01/02', 'latin')).toBe('1991/01/02')
  })

  it('accepts mixed digit input and emits the requested display system', () => {
    expect(sanitizeDateField('١۴0۵', 'persian')).toBe('۱۴۰۵')
    expect(sanitizeDateField('١۴0۵', 'latin')).toBe('1405')
  })

  it('parses localized integer input safely', () => {
    expect(parseLocalizedInteger('۱۴۰۵')).toBe(1405)
    expect(parseLocalizedInteger('١٤٠٥')).toBe(1405)
    expect(Number.isNaN(parseLocalizedInteger('14a5'))).toBe(true)
  })
})
