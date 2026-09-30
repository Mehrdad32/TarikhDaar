import { gregorianToPersian } from './core/persian'
import './styles.css'

const persianMonthNames = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

export default function App() {
  const source = { year: 1991, month: 1, day: 2 }
  const converted = gregorianToPersian(source)

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">TarikhDaar 6 · Alpha</p>
        <h1>تاریخ‌دار</h1>
        <p>یک تاریخ وارد کن؛ معادلش را در تقویم‌های دیگر ببین.</p>
      </section>

      <section className="card" aria-label="نمونه تبدیل تاریخ">
        <div>
          <span className="label">مبدأ · میلادی</span>
          <strong>2 January 1991</strong>
          <code>1991/01/02</code>
        </div>
        <span className="arrow" aria-hidden="true">←</span>
        <div>
          <span className="label">خورشیدی</span>
          <strong>{converted.day} {persianMonthNames[converted.month - 1]} {converted.year}</strong>
          <code>{converted.year}/{String(converted.month).padStart(2, '0')}/{String(converted.day).padStart(2, '0')}</code>
        </div>
      </section>

      <p className="note">اولین برش محصول: موتور مستقل تبدیل میلادی ↔ خورشیدی.</p>
    </main>
  )
}
