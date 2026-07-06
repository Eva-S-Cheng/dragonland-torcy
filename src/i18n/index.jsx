import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import fr from './fr.json'
import en from './en.json'
import zhHant from './zh-Hant.json'
import zhHans from './zh-Hans.json'

export const LANGS = {
  fr: { dict: fr, label: 'FR', name: 'Français', htmlLang: 'fr' },
  en: { dict: en, label: 'EN', name: 'English', htmlLang: 'en' },
  'zh-Hant': { dict: zhHant, label: '繁', name: '繁體中文', htmlLang: 'zh-Hant' },
  'zh-Hans': { dict: zhHans, label: '简', name: '简体中文', htmlLang: 'zh-Hans' },
}

const STORAGE_KEY = 'dragonland-lang'

function detectLang() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && LANGS[saved]) return saved
  const nav = (navigator.language || 'fr').toLowerCase()
  if (nav.startsWith('zh')) {
    return /tw|hk|mo|hant/.test(nav) ? 'zh-Hant' : 'zh-Hans'
  }
  if (nav.startsWith('en')) return 'en'
  return 'fr'
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLang)

  useEffect(() => {
    document.documentElement.lang = LANGS[lang].htmlLang
  }, [lang])

  const setLang = useCallback((code) => {
    if (!LANGS[code]) return
    setLangState(code)
    localStorage.setItem(STORAGE_KEY, code)
  }, [])

  // t('hero.title') → chaîne traduite, fallback FR puis clé brute
  const t = useCallback(
    (key) => {
      const walk = (dict) => key.split('.').reduce((o, k) => (o ? o[k] : undefined), dict)
      return walk(LANGS[lang].dict) ?? walk(fr) ?? key
    },
    [lang]
  )

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}