import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  loadSettings,
  normalizeSettings,
  saveSettings,
} from './settings'

function createStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))

  return {
    getItem(key: string) {
      return data.get(key) ?? null
    },
    setItem(key: string, value: string) {
      data.set(key, value)
    },
    snapshot() {
      return Object.fromEntries(data.entries())
    },
  }
}

describe('settings persistence', () => {
  it('uses defaults when storage is empty', () => {
    expect(loadSettings(createStorage())).toEqual(DEFAULT_SETTINGS)
  })

  it('persists Hijri adjustment and weekday preference', () => {
    const storage = createStorage()
    const settings = {
      ...DEFAULT_SETTINGS,
      hijriAdjustment: 1 as const,
      showWeekday: false,
    }

    saveSettings(settings, storage)

    expect(loadSettings(storage)).toEqual(settings)
  })

  it('recovers from malformed stored JSON', () => {
    const storage = createStorage({
      [SETTINGS_STORAGE_KEY]: '{bad-json',
    })

    expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS)
  })

  it('sanitizes unsupported values', () => {
    expect(normalizeSettings({
      version: 999,
      hijriMethod: 'unknown',
      hijriAdjustment: 9,
      showWeekday: 'yes',
    })).toEqual(DEFAULT_SETTINGS)
  })
})
