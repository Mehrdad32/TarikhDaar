import { useEffect, useMemo, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

interface DownloadCenterProps {
  open: boolean
  onClose(): void
}

const RELEASE_VERSION = '6.0.0-alpha.4'
const RELEASE_BASE = `https://github.com/Mehrdad32/TarikhDaar/releases/download/v${RELEASE_VERSION}`
const SETUP_URL = `${RELEASE_BASE}/TarikhDaar_${RELEASE_VERSION}_x64-setup.exe`
const PORTABLE_URL = `${RELEASE_BASE}/TarikhDaar_${RELEASE_VERSION}_x64_portable.exe`
const RELEASE_URL = `https://github.com/Mehrdad32/TarikhDaar/releases/tag/v${RELEASE_VERSION}`

export default function DownloadCenter({ open, onClose }: DownloadCenterProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  const platform = useMemo(() => {
    if (typeof navigator === 'undefined') return 'other'
    const ua = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua)) return 'ios'
    if (ua.includes('android')) return 'android'
    return 'other'
  }, [])

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
    setInstalled(standalone)

    const onBeforeInstall = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent
      promptEvent.preventDefault()
      setInstallPrompt(promptEvent)
    }

    const onInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])

  async function installPwa() {
    if (!installPrompt) return

    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    setInstallPrompt(null)

    if (choice.outcome === 'accepted') {
      setInstalled(true)
    }
  }

  if (!open) return null

  return (
    <div className="download-page" role="dialog" aria-modal="true" aria-labelledby="download-title">
      <div className="download-page-shell">
        <header className="download-header">
          <div>
            <span className="panel-label">TarikhDaar / OFFLINE</span>
            <h2 id="download-title">دانلود و استفاده آفلاین</h2>
            <p>
              تاریخ‌دار برای تبدیل تاریخ به اینترنت وابسته نیست. همین نسخه وب بعد از اولین
              بارگذاری فایل‌های لازم را روی دستگاه نگه می‌دارد و اگر این صفحه باز باشد با قطع
              اینترنت هم به کارش ادامه می‌دهد.
            </p>
          </div>

          <button
            type="button"
            className="download-close"
            onClick={onClose}
            aria-label="بستن صفحه دانلود"
            title="بستن"
          >
            ×
          </button>
        </header>

        <div className="download-grid">
          <section className="download-card download-card-pwa">
            <div className="download-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
                <path d="M10 18.5h4" />
              </svg>
            </div>

            <div className="download-card-copy">
              <span className="download-kicker">MOBILE / PWA</span>
              <h3>نصب روی موبایل</h3>
              <p>
                برای Android و iPhone/iPad پیشنهاد ما PWA است؛ آیکون تاریخ‌دار روی Home Screen
                قرار می‌گیرد، در یک پنجره مستقل باز می‌شود و بعد از اولین بارگذاری می‌تواند
                آفلاین کار کند.
              </p>

              {installed ? (
                <div className="install-status success">نسخه PWA روی این دستگاه نصب شده است ✓</div>
              ) : installPrompt ? (
                <button type="button" className="download-primary" onClick={installPwa}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3v12" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M5 21h14" />
                  </svg>
                  نصب PWA
                </button>
              ) : platform === 'ios' ? (
                <div className="install-guide">
                  <strong>روی iPhone / iPad:</strong>
                  <span>از منوی Share گزینه‌ی Add to Home Screen را بزن.</span>
                </div>
              ) : platform === 'android' ? (
                <div className="install-guide">
                  <strong>روی Android:</strong>
                  <span>از منوی مرورگر گزینه Install app یا Add to Home Screen را انتخاب کن.</span>
                </div>
              ) : (
                <div className="install-guide">
                  <strong>نصب PWA:</strong>
                  <span>از منوی مرورگر گزینه Install app / Add to Home Screen را انتخاب کن.</span>
                </div>
              )}
            </div>
          </section>

          <section className="download-card download-card-windows">
            <div className="download-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M3 5.5 10.5 4v7H3v-5.5Z" />
                <path d="M12 3.8 21 2v9h-9V3.8Z" />
                <path d="M3 13h7.5v7L3 18.5V13Z" />
                <path d="M12 13h9v9l-9-1.8V13Z" />
              </svg>
            </div>

            <div className="download-card-copy">
              <span className="download-kicker">WINDOWS / X64</span>
              <h3>نسخه ویندوز</h3>
              <p>
                اگر می‌خواهی تاریخ‌دار را بدون بازکردن مرورگر مثل یک برنامه معمولی اجرا کنی،
                نسخه ویندوز را بگیر.
              </p>

              <div className="windows-download-option">
                <div>
                  <div className="download-option-title">
                    <strong>نسخه نصب‌شونده</strong>
                    <span
                      className="info-badge"
                      title="پیشنهادی برای استفاده معمول: در Start Menu ثبت می‌شود و Uninstall استاندارد دارد."
                      aria-label="توضیح نسخه نصب‌شونده"
                    >
                      i
                    </span>
                  </div>
                  <small>پیشنهادی · Setup EXE · ثبت در Start Menu و Uninstall استاندارد</small>
                </div>
                <a className="download-file-button" href={SETUP_URL}>
                  دانلود Setup
                </a>
              </div>

              <div className="windows-download-option">
                <div>
                  <div className="download-option-title">
                    <strong>نسخه Portable</strong>
                    <span
                      className="info-badge"
                      title="بدون نصب اجرا می‌شود؛ فایل EXE را هرجا خواستی نگه دار و مستقیم باز کن. WebView2 باید روی ویندوز موجود باشد."
                      aria-label="توضیح نسخه Portable"
                    >
                      i
                    </span>
                  </div>
                  <small>بدون نصب · یک فایل EXE · مناسب فلش یا اجرای مستقیم</small>
                </div>
                <a className="download-file-button" href={PORTABLE_URL}>
                  دانلود Portable
                </a>
              </div>

              <a className="release-link" href={RELEASE_URL} target="_blank" rel="noreferrer">
                مشاهده Release و SHA-256 در GitHub
              </a>
            </div>
          </section>
        </div>

        <section className="offline-note">
          <span className="offline-note-icon" aria-hidden="true">!</span>
          <div>
            <strong>فرق نسخه وب با نصب آفلاین چیست؟</strong>
            <p>
              موتور تبدیل در همه نسخه‌ها یکسان و محلی است. نسخه وب/PWA فایل‌ها را در Cache مرورگر
              نگه می‌دارد؛ نسخه Windows فایل اجرایی مستقل دارد. هیچ‌کدام برای خودِ تبدیل تاریخ
              به API یا سرویس آنلاین نیاز ندارند.
            </p>
          </div>
        </section>

        <footer className="download-footer">
          <div>
            <span>باگ، پیشنهاد یا نکته‌ای پیدا کردی؟</span>
            <a href="mailto:mehrdad32.ir@gmail.com">mehrdad32.ir@gmail.com</a>
          </div>

          <a href="https://mehrdad32.ir" target="_blank" rel="noreferrer">
            mehrdad32.ir ↗
          </a>
        </footer>
      </div>
    </div>
  )
}
