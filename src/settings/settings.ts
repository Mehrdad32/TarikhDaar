import type { HijriMethod } from '../core/hijri'

export type HijriAdjustment = -2 | -1 | 0 | 1 | 2

export interface AppSettings {
  version: 1
  hijriMethod: HijriMethod
  hijriAdjustment: HijriAdjustment
  showWeekday: boolean
}

export const SETTINGS_STORAGE_KEY = 'tarikhdaar.settings.v1'

export const DEFAULT_SETTINGS: AppSettings = {
  version: 1,
  hijriMethod: 'civil',
  hijriAdjustment: 0,
  showWeekday: true,
}

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem?(key: string): void
}

const VALID_ADJUSTMENTS = new Set<HijriAdjustment>([-2, -1, 0, 1, 2])

export function normalizeSettings(value: unknown): AppSettings {
  if (!value || typeof value !== 'object') return DEFAULT_SETTINGS

  const candidate = value as Partial<AppSettings>

  return {
    version: 1,
    hijriMethod: candidate.hijriMethod === 'civil' ? 'civil' : DEFAULT_SETTINGS.hijriMethod,
    hijriAdjustment: VALID_ADJUSTMENTS.has(candidate.hijriAdjustment as HijriAdjustment)
      ? candidate.hijriAdjustment as HijriAdjustment
      : DEFAULT_SETTINGS.hijriAdjustment,
    showWeekday: typeof candidate.showWeekday === 'boolean'
      ? candidate.showWeekday
      : DEFAULT_SETTINGS.showWeekday,
  }
}

export function loadSettings(storage?: StorageLike | null): AppSettings {
  if (!storage) return DEFAULT_SETTINGS

  try {
    const raw = storage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS

    return normalizeSettings(JSON.parse(raw))
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings, storage?: StorageLike | null): void {
  if (!storage) return

  try {
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalizeSettings(settings)))
  } catch {
    // Persistence is best-effort; the app must continue working if storage is blocked.
  }
}
