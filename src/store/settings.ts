import { create } from 'zustand'
import { Settings } from '../types'

const STORAGE_KEY = 'hanzixue_settings'

const defaults: Settings = {
  primaryLanguage: 'vi',
  showSecondaryLanguage: false,
  showPinyin: true,
  writingCheckMode: 'auto',
  learningMode: 'zh-vi',
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaults, ...JSON.parse(raw) }
  } catch {}
  return defaults
}

function persist(s: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {}
}

interface SettingsStore extends Settings {
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  reset: () => void
}

export const useSettings = create<SettingsStore>((setState) => ({
  ...load(),
  set(key, value) {
    setState(prev => {
      const next = { ...prev, [key]: value }
      persist(next)
      return next
    })
  },
  reset() {
    persist(defaults)
    setState(defaults)
  },
}))
