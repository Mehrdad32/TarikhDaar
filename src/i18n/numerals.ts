export type DigitSystem = 'latin' | 'persian' | 'arabic'

const LATIN_DIGITS = '0123456789'
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

const DIGITS: Record<DigitSystem, string> = {
  latin: LATIN_DIGITS,
  persian: PERSIAN_DIGITS,
  arabic: ARABIC_DIGITS,
}

export function normalizeDigits(value: string): string {
  return Array.from(value, (char) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(char)
    if (persianIndex >= 0) return LATIN_DIGITS[persianIndex]

    const arabicIndex = ARABIC_DIGITS.indexOf(char)
    if (arabicIndex >= 0) return LATIN_DIGITS[arabicIndex]

    return char
  }).join('')
}

export function localizeDigits(value: string | number, system: DigitSystem): string {
  const normalized = normalizeDigits(String(value))
  const target = DIGITS[system]

  return Array.from(normalized, (char) => {
    const index = LATIN_DIGITS.indexOf(char)
    return index >= 0 ? target[index] : char
  }).join('')
}

export function sanitizeDateField(value: string, system: DigitSystem): string {
  const digitsOnly = normalizeDigits(value).replace(/\D/g, '')
  return localizeDigits(digitsOnly, system)
}

export function parseLocalizedInteger(value: string): number {
  const normalized = normalizeDigits(value).trim()

  if (!/^\d+$/.test(normalized)) return Number.NaN

  return Number.parseInt(normalized, 10)
}
