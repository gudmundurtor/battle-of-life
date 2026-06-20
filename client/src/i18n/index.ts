import { useLanguageStore } from '../store/languageStore'
import type { Language } from '../store/languageStore'
import type { Translations } from './types'
import { is } from './is'
import { en } from './en'
import { da } from './da'

const TRANSLATIONS: Record<Language, Translations> = { is, en, da }

export function getTranslations(lang: Language): Translations {
  return TRANSLATIONS[lang]
}

export function useT(): Translations {
  const language = useLanguageStore(s => s.language)
  return TRANSLATIONS[language]
}

export type { Language, Translations }
