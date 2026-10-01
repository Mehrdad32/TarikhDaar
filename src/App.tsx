import { useEffect, useMemo, useState } from 'react'
import { getTodayGregorian } from './core/date-utils'
import { validateGregorianDate } from './core/gregorian'
import {
  gregorianToHijri,
  hijriToGregorian,
  HIJRI_METHOD_LABELS,
  validateHijriDate,
} from './core/hijri'
import {
  gregorianToPersian,
  persianToGregorian,
  validatePersianDate,
  type CalendarDate,
} from './core/persian'
import {
  calendarDigitSystem,
  formatGregorianLong,
  formatHijriLong,
  formatNumericDate,
  formatPersianLong,
  formatWeekday,
  gregorianMonthNames,
  hijriMonthNames,
  persianMonthNames,
} from './i18n/calendar-format'
import {
  localizeDigits,
  parseLocalizedInteger,
  sanitizeDateField,
} from './i18n/numerals'
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type AppSettings,
  type HijriAdjustment,
} from './settings/settings'
import DownloadCenter from './DownloadCenter'
import './styles.css'

type CalendarKind = 'gregorian' | 'persian' | 'hijri'
type CopyFeedback = {
  calendar: CalendarKind
  status: 'copied' | 'error'
} | null

const CALENDARS: CalendarKind[] = ['gregorian', 'persian', 'hijri']

const calendarMeta: Record<CalendarKind, {
  title: string
  code: string
  lang: string
  className: string
}> = {
  gregorian: {
    title: 'میلادی',
    code: 'GREGORIAN',
    lang: 'en',
    className: 'calendar-gregorian',
  },
  persian: {
    title: 'خورشیدی',
    code: 'PERSIAN',
    lang: 'fa',
    className: 'calendar-persian',
  },
  hijri: {
    title: 'هجری قمری',
    code: 'HIJRI / CIVIL',
    lang: 'ar',
    className: 'calendar-arabic',
  },
}

function getMonthNames(calendar: CalendarKind) {
  if (calendar === 'persian') return persianMonthNames
  if (calendar === 'hijri') return hijriMonthNames
  return gregorianMonthNames
}

function formatLongDate(date: CalendarDate, calendar: CalendarKind): string {
  if (calendar === 'persian') return formatPersianLong(date)
  if (calendar === 'hijri') return formatHijriLong(date)
  return formatGregorianLong(date)
}

function toFields(date: CalendarDate, calendar: CalendarKind) {
  const system = calendarDigitSystem(calendar)

  return {
    day: localizeDigits(date.day, system),
    month: String(date.month),
    year: localizeDigits(date.year, system),
  }
}

function dateFromGregorian(
  gregorian: CalendarDate,
  calendar: CalendarKind,
  settings: AppSettings,
): CalendarDate {
  if (calendar === 'persian') return gregorianToPersian(gregorian)
  if (calendar === 'hijri') return gregorianToHijri(gregorian, settings.hijriAdjustment)
  return gregorian
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

  if (!copied) throw new Error('Clipboard copy failed')
}

export default function App() {
  const [initialDate] = useState<CalendarDate>(() => getTodayGregorian())
  const [sourceCalendar, setSourceCalendar] = useState<CalendarKind>('gregorian')
  const [day, setDay] = useState(() => String(initialDate.day))
  const [month, setMonth] = useState(() => String(initialDate.month))
  const [year, setYear] = useState(() => String(initialDate.year))
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadSettings(typeof window === 'undefined' ? null : window.localStorage),
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(() => typeof window !== 'undefined' && window.location.hash === '#download')
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>(null)

  useEffect(() => {
    saveSettings(settings, typeof window === 'undefined' ? null : window.localStorage)
  }, [settings])

  useEffect(() => {
    const onHashChange = () => setDownloadOpen(window.location.hash === '#download')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!settingsOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSettingsOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [settingsOpen])

  const digitSystem = calendarDigitSystem(sourceCalendar)
  const monthNames = getMonthNames(sourceCalendar)

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

    if (sourceCalendar === 'persian') return validatePersianDate(sourceDate)
    if (sourceCalendar === 'hijri') return validateHijriDate(sourceDate)
    return validateGregorianDate(sourceDate)
  }, [day, month, sourceCalendar, sourceDate, year])

  const sourceConversion = useMemo(() => {
    if (validationError) {
      return { date: null as CalendarDate | null, error: null as string | null }
    }

    try {
      const gregorian = sourceCalendar === 'persian'
        ? persianToGregorian(sourceDate)
        : sourceCalendar === 'hijri'
          ? hijriToGregorian(sourceDate, settings.hijriAdjustment)
          : sourceDate

      const gregorianError = validateGregorianDate(gregorian)
      if (gregorianError) {
        return { date: null as CalendarDate | null, error: gregorianError }
      }

      return { date: gregorian, error: null as string | null }
    } catch (error) {
      console.error('Date conversion failed safely:', error)
      return {
        date: null as CalendarDate | null,
        error: 'این تاریخ در بازه فعلی موتور تبدیل پشتیبانی نمی‌شود.',
      }
    }
  }, [settings.hijriAdjustment, sourceCalendar, sourceDate, validationError])

  const canonicalGregorian = sourceConversion.date
  const displayError = validationError ?? sourceConversion.error
  const targetCalendars = CALENDARS.filter((calendar) => calendar !== sourceCalendar)

  const results = useMemo(() => {
    return targetCalendars.map((calendar) => {
      if (!canonicalGregorian || displayError) {
        return {
          calendar,
          date: null as CalendarDate | null,
          error: displayError,
        }
      }

      try {
        return {
          calendar,
          date: dateFromGregorian(canonicalGregorian, calendar, settings),
          error: null as string | null,
        }
      } catch (error) {
        console.error(`Conversion to ${calendar} failed safely:`, error)

        return {
          calendar,
          date: null as CalendarDate | null,
          error: calendar === 'hijri'
            ? 'برای این تاریخ، نتیجه قمری در بازه فعلی قابل محاسبه نیست.'
            : 'این تبدیل در بازه فعلی پشتیبانی نمی‌شود.',
        }
      }
    })
  }, [canonicalGregorian, displayError, settings, targetCalendars])

  function applyDate(date: CalendarDate, calendar: CalendarKind) {
    const fields = toFields(date, calendar)
    setDay(fields.day)
    setMonth(fields.month)
    setYear(fields.year)
    setCopyFeedback(null)
  }

  function changeSourceCalendar(next: CalendarKind) {
    if (next === sourceCalendar) return

    if (canonicalGregorian && !displayError) {
      try {
        applyDate(dateFromGregorian(canonicalGregorian, next, settings), next)
      } catch {
        setDay((value) => sanitizeDateField(value, calendarDigitSystem(next)))
        setYear((value) => sanitizeDateField(value, calendarDigitSystem(next)))
      }
    } else {
      setDay((value) => sanitizeDateField(value, calendarDigitSystem(next)))
      setYear((value) => sanitizeDateField(value, calendarDigitSystem(next)))
    }

    setSourceCalendar(next)
  }

  function updateDay(value: string) {
    setDay(sanitizeDateField(value, digitSystem))
    setCopyFeedback(null)
  }

  function updateYear(value: string) {
    setYear(sanitizeDateField(value, digitSystem))
    setCopyFeedback(null)
  }

  function setToday() {
    const todayGregorian = getTodayGregorian()
    applyDate(dateFromGregorian(todayGregorian, sourceCalendar, settings), sourceCalendar)
  }

  function updateHijriAdjustment(next: HijriAdjustment) {
    const currentGregorian = canonicalGregorian

    setSettings((current) => ({
      ...current,
      hijriAdjustment: next,
    }))

    if (sourceCalendar === 'hijri' && currentGregorian) {
      try {
        applyDate(
          gregorianToHijri(currentGregorian, next),
          'hijri',
        )
      } catch {
        // The current source stays editable even if the adjusted value leaves the supported range.
      }
    }
  }

  function openDownloadCenter() {
    if (window.location.hash !== '#download') {
      window.location.hash = 'download'
    } else {
      setDownloadOpen(true)
    }
  }

  function closeDownloadCenter() {
    if (window.location.hash === '#download') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }
    setDownloadOpen(false)
  }

  async function copyResult(calendar: CalendarKind, date: CalendarDate) {
    if (!canonicalGregorian) return

    const long = formatLongDate(date, calendar)
    const weekday = settings.showWeekday
      ? formatWeekday(canonicalGregorian, calendar)
      : ''
    const numeric = formatNumericDate(date, calendar)
    const value = [long, weekday, numeric].filter(Boolean).join('\n')

    try {
      await copyText(value)
      setCopyFeedback({ calendar, status: 'copied' })
      window.setTimeout(() => setCopyFeedback(null), 1600)
    } catch (error) {
      console.error('Copy failed:', error)
      setCopyFeedback({ calendar, status: 'error' })
      window.setTimeout(() => setCopyFeedback(null), 2200)
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

        <div className="topbar-actions">
          <div className="product-status" dir="ltr">
            <span className="status-dot" aria-hidden="true" />
            <span>LOCAL / OFFLINE</span>
            <span className="status-divider" aria-hidden="true">·</span>
            <span>V6 ALPHA.5</span>
          </div>

          <button
            type="button"
            className="download-trigger"
            onClick={openDownloadCenter}
            aria-label="دانلود و استفاده آفلاین"
            title="دانلود و استفاده آفلاین"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            <span>دانلود</span>
          </button>

          <button
            type="button"
            className="settings-trigger"
            onClick={() => setSettingsOpen(true)}
            aria-label="تنظیمات"
            title="تنظیمات"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.86 2.86-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1A1.7 1.7 0 0 0 8.2 19.3a1.7 1.7 0 0 0-1.48.44l-.06.06-2.86-2.86.06-.06A1.7 1.7 0 0 0 4.2 15a1.7 1.7 0 0 0-1.5-1H2.6v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.34-1.88L3.8 7.06 6.66 4.2l.06.06A1.7 1.7 0 0 0 8.6 4.6a1.7 1.7 0 0 0 1-1.5V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.86 2.86-.06.06A1.7 1.7 0 0 0 19 9a1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.1 1Z" />
            </svg>
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow" dir="ltr">
          <span className="eyebrow-line" aria-hidden="true" />
          DATE CONVERTER / 006
        </div>
        <h1>یک تاریخ وارد کن.</h1>
        <p>معادلش همان لحظه در همه‌ی تقویم‌های دیگر نمایش داده می‌شود.</p>
      </section>

      <section className="workspace">
        <article className="panel source-panel" aria-labelledby="source-title">
          <div className="panel-header">
            <div>
              <span className="panel-label">تاریخ مبدأ</span>
              <h2 id="source-title">{calendarMeta[sourceCalendar].title}</h2>
            </div>
            <span className="panel-code" dir="ltr">{calendarMeta[sourceCalendar].code}</span>
          </div>

          <div className="source-controls">
            <div className="calendar-switch calendar-switch-three" aria-label="انتخاب تقویم مبدأ">
              {CALENDARS.map((calendar) => (
                <button
                  key={calendar}
                  type="button"
                  className={sourceCalendar === calendar ? 'active' : ''}
                  aria-pressed={sourceCalendar === calendar}
                  onClick={() => changeSourceCalendar(calendar)}
                >
                  {calendarMeta[calendar].title}
                </button>
              ))}
            </div>

            <button className="today-button" type="button" onClick={setToday}>
              امروز
            </button>
          </div>

          <div className={`date-inputs ${calendarMeta[sourceCalendar].className}`}>
            <label className="field field-day">
              <span>روز</span>
              <input
                value={day}
                onChange={(event) => updateDay(event.target.value)}
                inputMode="numeric"
                autoComplete="off"
                aria-invalid={Boolean(displayError)}
                lang={calendarMeta[sourceCalendar].lang}
              />
            </label>

            <label className="field field-month">
              <span>ماه</span>
              <select
                value={month}
                onChange={(event) => {
                  setMonth(event.target.value)
                  setCopyFeedback(null)
                }}
                dir={sourceCalendar === 'gregorian' ? 'ltr' : 'rtl'}
                lang={calendarMeta[sourceCalendar].lang}
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
                lang={calendarMeta[sourceCalendar].lang}
              />
            </label>
          </div>

          {sourceCalendar === 'hijri' && (
            <div className="hijri-source-note">
              <span aria-hidden="true">i</span>
              تاریخ قمری محاسباتی است و بسته به رؤیت هلال ممکن است ۱ تا ۲ روز اختلاف داشته باشد.
            </div>
          )}

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
              <span className="panel-label">نتایج تبدیل</span>
              <h2 id="results-title">تقویم‌های دیگر</h2>
            </div>
            <span className="panel-code result-code" dir="ltr">ALL TARGETS</span>
          </div>

          <div className="results-stack">
            {results.map(({ calendar, date, error }) => {
              const meta = calendarMeta[calendar]
              const copied = copyFeedback?.calendar === calendar && copyFeedback.status === 'copied'
              const copyError = copyFeedback?.calendar === calendar && copyFeedback.status === 'error'

              return (
                <article
                  key={calendar}
                  className={`calendar-result ${calendar === 'hijri' ? 'calendar-result-hijri' : ''} ${date ? '' : 'calendar-result-disabled'}`}
                >
                  <div className="calendar-result-main">
                    <div className="calendar-result-heading">
                      <span className="result-label">{meta.title}</span>
                      <span className="calendar-result-code" dir="ltr">{meta.code}</span>
                    </div>

                    {date && canonicalGregorian ? (
                      <>
                        <strong
                          className={`calendar-result-primary ${meta.className}`}
                          dir={calendar === 'gregorian' ? 'ltr' : 'rtl'}
                          lang={meta.lang}
                        >
                          {formatLongDate(date, calendar)}
                        </strong>

                        <div className="calendar-result-meta-line">
                          {settings.showWeekday && (
                            <span
                              className={`result-weekday ${meta.className}`}
                              dir={calendar === 'gregorian' ? 'ltr' : 'rtl'}
                              lang={meta.lang}
                            >
                              {formatWeekday(canonicalGregorian, calendar)}
                            </span>
                          )}
                          <span
                            className={`result-numeric ${meta.className}`}
                            dir={calendar === 'gregorian' ? 'ltr' : 'rtl'}
                            lang={meta.lang}
                          >
                            {formatNumericDate(date, calendar)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="calendar-result-error">{error ?? 'نتیجه در دسترس نیست.'}</span>
                    )}

                    {calendar === 'hijri' && date && (
                      <p className="hijri-note">
                        ممکن است بر اساس رؤیت هلال ۱ تا ۲ روز تفاوت داشته باشد.
                        {settings.hijriAdjustment !== 0 && (
                          <> اصلاح دستی: {settings.hijriAdjustment > 0 ? '+' : ''}{localizeDigits(settings.hijriAdjustment, 'persian')} روز.</>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="calendar-result-actions">
                    <button
                      type="button"
                      className={`icon-action ${copied ? 'success' : ''} ${copyError ? 'error' : ''}`}
                      onClick={() => date && copyResult(calendar, date)}
                      disabled={!date}
                      aria-label={copied ? 'کپی شد' : copyError ? 'کپی انجام نشد' : 'کپی نتیجه'}
                      title={copied ? 'کپی شد' : copyError ? 'کپی انجام نشد' : 'کپی نتیجه'}
                      data-tooltip={copied ? 'کپی شد' : copyError ? 'کپی انجام نشد' : 'کپی نتیجه'}
                    >
                      {copied ? (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="m5 12 4 4L19 6" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <rect x="9" y="9" width="10" height="10" rx="2" />
                          <path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                        </svg>
                      )}
                    </button>

                    <button
                      type="button"
                      className="icon-action"
                      onClick={() => changeSourceCalendar(calendar)}
                      disabled={!date}
                      aria-label="این تاریخ را مبدأ کن"
                      title="این تاریخ را مبدأ کن"
                      data-tooltip="این تاریخ را مبدأ کن"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M7 7h11l-3-3" />
                        <path d="m18 7-3 3" />
                        <path d="M17 17H6l3 3" />
                        <path d="m6 17 3-3" />
                      </svg>
                    </button>
                  </div>
                </article>
              )
            })}
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
        <a href="https://mehrdad32.ir" target="_blank" rel="noreferrer" dir="ltr">
          Mehrdad32.ir / TarikhDaar ↗
        </a>
      </footer>

      <DownloadCenter open={downloadOpen} onClose={closeDownloadCenter} />

      {settingsOpen && (
        <div
          className="settings-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSettingsOpen(false)
          }}
        >
          <section
            className="settings-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
          >
            <header className="settings-header">
              <div>
                <span className="panel-label">TarikhDaar</span>
                <h2 id="settings-title">تنظیمات</h2>
              </div>

              <button
                type="button"
                className="settings-close"
                onClick={() => setSettingsOpen(false)}
                aria-label="بستن تنظیمات"
                title="بستن"
              >
                ×
              </button>
            </header>

            <div className="settings-section">
              <div className="settings-section-title">
                <span>هجری قمری</span>
                <small dir="ltr">HIJRI</small>
              </div>

              <label className="settings-field">
                <span>روش محاسبه</span>
                <select
                  value={settings.hijriMethod}
                  onChange={() => {
                    // Civil is the first supported method; additional algorithms plug in here later.
                  }}
                >
                  <option value="civil">{HIJRI_METHOD_LABELS.civil}</option>
                </select>
              </label>

              <div className="settings-field">
                <span>اصلاح روز</span>
                <div className="adjustment-switch" dir="ltr">
                  {([-2, -1, 0, 1, 2] as HijriAdjustment[]).map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={settings.hijriAdjustment === value ? 'active' : ''}
                      onClick={() => updateHijriAdjustment(value)}
                    >
                      {value > 0 ? '+' : ''}{value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hijri-settings-note">
                <span aria-hidden="true">i</span>
                <p>
                  تقویم قمری محاسباتی با رؤیت واقعی هلال یکی نیست؛ بسته به کشور، محل رؤیت و روش تقویم ممکن است ۱ تا ۲ روز اختلاف دیده شود.
                </p>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">
                <span>نمایش</span>
                <small dir="ltr">DISPLAY</small>
              </div>

              <label className="toggle-row">
                <div>
                  <strong>نمایش روز هفته</strong>
                  <small>در کارت نتیجه و هنگام کپی</small>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showWeekday}
                  onChange={(event) => {
                    setSettings((current) => ({
                      ...current,
                      showWeekday: event.target.checked,
                    }))
                  }}
                />
              </label>
            </div>

            <footer className="settings-footer">
              <span>
                تنظیمات به‌صورت خودکار روی همین دستگاه ذخیره می‌شوند.
              </span>
              <button
                type="button"
                onClick={() => {
                  setSettings(DEFAULT_SETTINGS)
                  if (sourceCalendar === 'hijri' && canonicalGregorian) {
                    applyDate(gregorianToHijri(canonicalGregorian, 0), 'hijri')
                  }
                }}
              >
                بازنشانی
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  )
}
