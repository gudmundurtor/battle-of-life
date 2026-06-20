import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'is' | 'en' | 'da'

interface LanguageStore {
  language: Language
  setLanguage: (lang: Language) => void
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'is',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'jones-language' },
  ),
)
