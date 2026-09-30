import { useMemo, useState } from 'react'
import { validateGregorianDate } from './core/gregorian'
import {
  gregorianToPersian,
  persianToGregorian,
  validatePersianDate,
  type CalendarDate,
} from './core/persian'
import './styles.css'

type CalendarKind = 'gregorian' | 'persian'

const gregorianMonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const persianMonthNames = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

function toNumber(value: string): number {
  return Number.parseInt(value, 10)
}

function toFields(date: CalendarDate) {
  return {
    day: String(date.day),
    month: String(date.month),
    year: String(date.year),
  }
}

export default function App() {
  const [sourceCalendar, setSourceCalendar] = useState<CalendarKind>('gregorian')
  const [day, setDay] = useState('2')
  const [month, setMonth] = useState('1')
  const [year, setYear] = useState('1991')

  const sourceDate = useMemo(
    () => ({ year: toNumber(year), month: toNumber(month), day: toNumber(day) }),
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

  const converted = useMemo(() => {
    if (validationError) return null

    return sourceCalendar === 'gregorian'
      ? gregorianToPersian(sourceDate)
      : persianToGregorian(sourceDate)
  }, [sourceCalendar, sourceDate, validationError])

  const monthNames = sourceCalendar === 'gregorian' ? gregorianMonthNames : persianMonthNames
  const targetCalendar: CalendarKind = sourceCalendar === 'gregorian' ? 'persian' : 'gregorian'

  function changeSourceCalendar(next: CalendarKind) {
    if (next === sourceCalendar) return

    if (!validationError && converted) {
      const nextFields = toFields(converted)
      setDay(nextFields.day)
      setMonth(nextFields.month)
      setYear(nextFields.year)
    }

    setSourceCalendar(next)
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
          <span>V6 ALPHA</span>
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

          <div className="date-inputs">
            <label className="field field-day">
              <span>روز</span>
              <input
                value={day}
                onChange={(event) => setDay(event.target.value)}
                inputMode="numeric"
                autoComplete="off"
                aria-invalid={Boolean(validationError)}
              />
            </label>

            <label className="field field-month">
              <span>ماه</span>
              <select
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                dir={sourceCalendar === 'gregorian' ? 'ltr' : 'rtl'}
              >
                {monthNames.map((name, index) => {
                  const number = index + 1
                  return (
                    <option key={name} value={number}>
                      {String(number).padStart(2, '0')} · {name}
                    </option>
                  )
                })}
              </select>
            </label>

            <label className="field field-year">
              <span>سال</span>
              <input
                value={year}
                onChange={(event) => setYear(event.target.value)}
                inputMode="numeric"
                autoComplete="off"
                aria-invalid={Boolean(validationError)}
              />
            </label>
          </div>

          <div className="panel-footer">
            {validationError ? (
              <p className="validation-message" role="alert">
                <span className="message-icon" aria-hidden="true">!</span>
                {validationError}
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
              targetCalendar === 'persian' ? (
                <>
                  <span className="result-label">هجری خورشیدی · Persian</span>
                  <strong className="result-primary calendar-persian">
                    {converted.day} {persianMonthNames[converted.month - 1]} {converted.year}
                  </strong>
                  <span className="result-numeric calendar-persian" dir="ltr">
                    {converted.year}/{String(converted.month).padStart(2, '0')}/{String(converted.day).padStart(2, '0')}
                  </span>
                </>
              ) : (
                <>
                  <span className="result-label">میلادی · Gregorian</span>
                  <strong className="result-primary calendar-gregorian" dir="ltr">
                    {converted.day} {gregorianMonthNames[converted.month - 1]} {converted.year}
                  </strong>
                  <span className="result-numeric calendar-gregorian" dir="ltr">
                    {converted.year}/{String(converted.month).padStart(2, '0')}/{String(converted.day).padStart(2, '0')}
                  </span>
                </>
              )
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
