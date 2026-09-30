import { useMemo, useState } from 'react'
import { validateGregorianDate } from './core/gregorian'
import { gregorianToPersian } from './core/persian'
import './styles.css'

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

export default function App() {
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

    return validateGregorianDate(sourceDate)
  }, [day, month, sourceDate, year])

  const converted = useMemo(
    () => (validationError ? null : gregorianToPersian(sourceDate)),
    [sourceDate, validationError],
  )

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <span className="brand-mark" aria-hidden="true">ت</span>
          <span className="brand">تاریخ‌دار</span>
        </div>
        <span className="version">TarikhDaar 6 · Alpha</span>
      </header>

      <section className="hero">
        <p className="eyebrow">تبدیل سریع و آفلاین تاریخ</p>
        <h1>یک تاریخ وارد کن.</h1>
        <p>معادلش همان لحظه در تقویم‌های دیگر نمایش داده می‌شود.</p>
      </section>

      <section className="source-panel" aria-labelledby="source-title">
        <div className="section-heading">
          <div>
            <span className="section-kicker">تاریخ مبدأ</span>
            <h2 id="source-title">میلادی</h2>
          </div>
          <span className="calendar-badge">Gregorian</span>
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
            <select value={month} onChange={(event) => setMonth(event.target.value)}>
              {gregorianMonthNames.map((name, index) => {
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

        {validationError ? (
          <p className="validation-message" role="alert">
            <span aria-hidden="true">!</span>
            {validationError}
          </p>
        ) : (
          <p className="input-hint">نیازی به دکمه تبدیل نیست؛ نتیجه با هر تغییر به‌روز می‌شود.</p>
        )}
      </section>

      <section className="results" aria-labelledby="results-title">
        <div className="results-heading">
          <div>
            <span className="section-kicker">نتیجه</span>
            <h2 id="results-title">تقویم خورشیدی</h2>
          </div>
        </div>

        <article className={`result-card ${converted ? '' : 'result-card-disabled'}`}>
          {converted ? (
            <>
              <span className="result-label">هجری خورشیدی · Persian</span>
              <strong className="result-primary">
                {converted.day} {persianMonthNames[converted.month - 1]} {converted.year}
              </strong>
              <span className="result-numeric" dir="ltr">
                {converted.year}/{String(converted.month).padStart(2, '0')}/{String(converted.day).padStart(2, '0')}
              </span>
            </>
          ) : (
            <>
              <span className="result-label">هجری خورشیدی · Persian</span>
              <strong className="result-placeholder">تاریخ مبدأ را اصلاح کنید</strong>
              <span className="result-numeric">—</span>
            </>
          )}
        </article>
      </section>
    </main>
  )
}
