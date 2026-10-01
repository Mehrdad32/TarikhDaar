import { useMemo, useState } from 'react'
import { getTodayGregorian } from './core/date-utils'
import { validateGregorianDate } from './core/gregorian'
import {
  gregorianToPersian,
  persianToGregorian,
  validatePersianDate,
  type CalendarDate,
} from './core/persian'
import {
  calendarDigitSystem,
  formatGregorianLong,
  formatNumericDate,
  formatPersianLong,
  formatWeekday,
  gregorianMonthNames,
  persianMonthNames,
} from './i18n/calendar-format'
import {
  localizeDigits,
  parseLocalizedInteger,
  sanitizeDateField,
} from './i18n/numerals'
import './styles.css'

type CalendarKind = 'gregorian' | 'persian'
type CopyState = 'idle' | 'copied' | 'error'

function toFields(date: CalendarDate, calendar: CalendarKind) {
  const system = calendarDigitSystem(calendar)

  return {
    day: localizeDigits(date.day, system),
    month: String(date.month),
    year: localizeDigits(date.year, system),
  }
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'
  document.body.appendChild(textarea)
  textarea.select()

  const copied = document.execCommand('copy')
  textarea.remove()

  if (!copied) {
    throw new Error('Clipboard copy failed')
  }
}

export default function App() {
  const [sourceCalendar, setSourceCalendar] = useState<CalendarKind>('gregorian')
  const [day, setDay] = useState('2')
  const [month, setMonth] = useState('1')
  const [year, setYear] = useState('1991')
  const [copyState, setCopyState] = useState<CopyState>('idle')

  const digitSystem = calendarDigitSystem(sourceCalendar)

  const sourceDate = useMemo(
    () => ({
      year: parseLocalizedInteger(year),
      month: Number.parseInt(month, 10),
      day: parseLocalizedInteger(day),
    }),
    [day, month, year],
  )

  const validationError = useMemo(() => {
    if (!day.trim() || !month.trim() || !year.trim()) {
      return 'روز، ماه و سال را کامل وارد کنید.'
    }

    return sourceCalendar === 'gregorian'
      ? validateGregorianDate(sourceDate)
      : validatePersianDate(sourceDate)
  }, [day, month, sourceCalendar, sourceDate, year])

  const conversion = useMemo(() => {
    if (validationError) {
      return { date: null as CalendarDate | null, error: null as string | null }
    }

    try {
      const date = sourceCalendar === 'gregorian'
        ? gregorianToPersian(sourceDate)
        : persianToGregorian(sourceDate)

      return { date, error: null as string | null }
    } catch (error) {
      console.error('Date conversion failed safely:', error)

      return {
        date: null as CalendarDate | null,
        error: 'این تاریخ در بازه فعلی موتور تبدیل پشتیبانی نمی‌شود.',
      }
    }
  }, [sourceCalendar, sourceDate, validationError])

  const converted = conversion.date
  const displayError = validationError ?? conversion.error

  const monthNames = sourceCalendar === 'gregorian' ? gregorianMonthNames : persianMonthNames
  const targetCalendar: CalendarKind = sourceCalendar === 'gregorian' ? 'persian' : 'gregorian'

  const canonicalGregorianDate = useMemo(() => {
    if (displayError || !converted) return null

    return sourceCalendar === 'gregorian' ? sourceDate : converted
  }, [converted, displayError, sourceCalendar, sourceDate])

  const resultLong = useMemo(() => {
    if (!converted) return ''

    return targetCalendar === 'persian'
      ? formatPersianLong(converted)
      : formatGregorianLong(converted)
  }, [converted, targetCalendar])

  const resultNumeric = useMemo(() => {
    if (!converted) return ''

    return formatNumericDate(converted, targetCalendar)
  }, [converted, targetCalendar])

  const resultWeekday = useMemo(() => {
    if (!canonicalGregorianDate) return ''

    return formatWeekday(canonicalGregorianDate, targetCalendar)
  }, [canonicalGregorianDate, targetCalendar])

  function applyDate(date: CalendarDate, calendar: CalendarKind) {
    const fields = toFields(date, calendar)
    setDay(fields.day)
    setMonth(fields.month)
    setYear(fields.year)
    setCopyState('idle')
  }

  function changeSourceCalendar(next: CalendarKind) {
    if (next === sourceCalendar) return

    if (!displayError && converted) {
      applyDate(converted, next)
    } else {
      setDay((value) => sanitizeDateField(value, calendarDigitSystem(next)))
      setYear((value) => sanitizeDateField(value, calendarDigitSystem(next)))
      setCopyState('idle')
    }

    setSourceCalendar(next)
  }

  function updateDay(value: string) {
    setDay(sanitizeDateField(value, digitSystem))
    setCopyState('idle')
  }

  function updateYear(value: string) {
    setYear(sanitizeDateField(value, digitSystem))
    setCopyState('idle')
  }

  function setToday() {
    const todayGregorian = getTodayGregorian()
    const todayForSource = sourceCalendar === 'gregorian'
      ? todayGregorian
      : gregorianToPersian(todayGregorian)

    applyDate(todayForSource, sourceCalendar)
  }

  async function copyResult() {
    if (!converted) return

    const value = [resultLong, resultNumeric].filter(Boolean).join('\n')

    try {
      await copyText(value)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1600)
    } catch (error) {
      console.error('Copy failed:', error)
      setCopyState('error')
      window.setTimeout(() => setCopyState('idle'), 2200)
    }
  }

  return (
    <main className="app-shell">
      <div className="grid-background" aria-hidden="true" />
      <div className="ambient ambient-emerald" aria-hidden="true" />
      <div className="ambient ambient-blue" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">ت</span>
          <div className="brand-copy">
            <span className="brand">تاریخ‌دار</span>
            <span className="brand-en" dir="ltr">TarikhDaar</span>
          </div>
        </div>

        <div className="product-status" dir="ltr">
          <span className="status-dot" aria-hidden="true" />
          <span>LOCAL / OFFLINE</span>
          <span className="status-divider" aria-hidden="true">·</span>
          <span>V6 ALPHA.3</span>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow" dir="ltr">
          <span className="eyebrow-line" aria-hidden="true" />
          DATE CONVERTER / 006
        </div>
        <h1>یک تاریخ وارد کن.</h1>
        <p>معادلش همان لحظه، دقیق و بدون نیاز به اینترنت نمایش داده می‌شود.</p>
      </section>

      <section className="workspace">
        <article className="panel source-panel" aria-labelledby="source-title">
          <div className="panel-header">
            <div>
              <span className="panel-label">تاریخ مبدأ</span>
              <h2 id="source-title">
                {sourceCalendar === 'gregorian' ? 'میلادی' : 'خورشیدی'}
              </h2>
            </div>

            <span className="panel-code" dir="ltr">
              {sourceCalendar === 'gregorian' ? 'GREGORIAN' : 'PERSIAN'}
            </span>
          </div>

          <div className="source-controls">
            <div className="calendar-switch" aria-label="انتخاب تقویم مبدأ">
              <button
                type="button"
                className={sourceCalendar === 'gregorian' ? 'active' : ''}
                aria-pressed={sourceCalendar === 'gregorian'}
                onClick={() => changeSourceCalendar('gregorian')}
              >
                میلادی
              </button>
              <button
                type="button"
                className={sourceCalendar === 'persian' ? 'active' : ''}
                aria-pressed={sourceCalendar === 'persian'}
                onClick={() => changeSourceCalendar('persian')}
              >
                خورشیدی
              </button>
            </div>

            <button className="today-button" type="button" onClick={setToday}>
              امروز
            </button>
          </div>

          <div className={`date-inputs ${sourceCalendar === 'persian' ? 'calendar-persian' : 'calendar-gregorian'}`}>
            <label className="field field-day">
              <span>روز</span>
              <input
                value={day}
                onChange={(event) => updateDay(event.target.value)}
                inputMode="numeric"
                autoComplete="off"
                aria-invalid={Boolean(displayError)}
                lang={sourceCalendar === 'persian' ? 'fa' : 'en'}
              />
            </label>

            <label className="field field-month">
              <span>ماه</span>
              <select
                value={month}
                onChange={(event) => {
                  setMonth(event.target.value)
                  setCopyState('idle')
                }}
                dir={sourceCalendar === 'gregorian' ? 'ltr' : 'rtl'}
                lang={sourceCalendar === 'persian' ? 'fa' : 'en'}
              >
                {monthNames.map((name, index) => {
                  const number = index + 1
                  const displayNumber = localizeDigits(
                    String(number).padStart(2, '0'),
                    digitSystem,
                  )

                  return (
                    <option key={name} value={number}>
                      {displayNumber} · {name}
                    </option>
                  )
                })}
              </select>
            </label>

            <label className="field field-year">
              <span>سال</span>
              <input
                value={year}
                onChange={(event) => updateYear(event.target.value)}
                inputMode="numeric"
                autoComplete="off"
                aria-invalid={Boolean(displayError)}
                lang={sourceCalendar === 'persian' ? 'fa' : 'en'}
              />
            </label>
          </div>

          <div className="panel-footer">
            {displayError ? (
              <p className="validation-message" role="alert">
                <span className="message-icon" aria-hidden="true">!</span>
                {displayError}
              </p>
            ) : (
              <p className="input-hint">
                <span className="live-dot" aria-hidden="true" />
                تبدیل زنده است؛ با هر تغییر، نتیجه همان لحظه به‌روز می‌شود.
              </p>
            )}
          </div>
        </article>

        <article className="panel result-panel" aria-labelledby="results-title">
          <div className="panel-header">
            <div>
              <span className="panel-label">نتیجه تبدیل</span>
              <h2 id="results-title">
                {targetCalendar === 'persian' ? 'خورشیدی' : 'میلادی'}
              </h2>
            </div>

            <span className="panel-code result-code" dir="ltr">
              {targetCalendar === 'persian' ? 'PERSIAN' : 'GREGORIAN'}
            </span>
          </div>

          <div className={`result-display ${converted ? '' : 'result-disabled'}`}>
            <div className="result-orbit" aria-hidden="true" />
            {converted ? (
              <>
                <span className="result-label">
                  {targetCalendar === 'persian' ? 'هجری خورشیدی · Persian' : 'میلادی · Gregorian'}
                </span>

                <strong
                  className={`result-primary ${targetCalendar === 'persian' ? 'calendar-persian' : 'calendar-gregorian'}`}
                  dir={targetCalendar === 'gregorian' ? 'ltr' : 'rtl'}
                  lang={targetCalendar === 'persian' ? 'fa' : 'en'}
                >
                  {resultLong}
                </strong>

                <span
                  className={`result-weekday ${targetCalendar === 'persian' ? 'calendar-persian' : 'calendar-gregorian'}`}
                  dir={targetCalendar === 'gregorian' ? 'ltr' : 'rtl'}
                  lang={targetCalendar === 'persian' ? 'fa' : 'en'}
                >
                  {resultWeekday}
                </span>

                <span
                  className={`result-numeric ${targetCalendar === 'persian' ? 'calendar-persian' : 'calendar-gregorian'}`}
                  dir={targetCalendar === 'persian' ? 'rtl' : 'ltr'}
                  lang={targetCalendar === 'persian' ? 'fa' : 'en'}
                >
                  {resultNumeric}
                </span>
              </>
            ) : (
              <>
                <span className="result-label">
                  {targetCalendar === 'persian' ? 'هجری خورشیدی · Persian' : 'میلادی · Gregorian'}
                </span>
                <strong className="result-placeholder">تاریخ مبدأ را اصلاح کنید</strong>
                <span className="result-numeric">—</span>
              </>
            )}
          </div>

          <div className="result-actions">
            <button
              type="button"
              className={`action-button action-primary ${copyState === 'copied' ? 'success' : ''}`}
              onClick={copyResult}
              disabled={!converted}
            >
              {copyState === 'copied' ? 'کپی شد ✓' : copyState === 'error' ? 'کپی نشد' : 'کپی نتیجه'}
            </button>

            <button
              type="button"
              className="action-button"
              onClick={() => changeSourceCalendar(targetCalendar)}
              disabled={!converted}
            >
              مبدأ کن
            </button>
          </div>

          <div className="result-meta" dir="ltr">
            <span>INSTANT</span>
            <span>PRIVATE</span>
            <span>OPEN SOURCE</span>
          </div>
        </article>
      </section>

      <footer className="app-footer">
        <span>Fast · Offline · Private</span>
        <span dir="ltr">Mehrdad32 / TarikhDaar</span>
      </footer>
    </main>
  )
}
