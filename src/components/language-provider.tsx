"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { LOCALE_COOKIE, getDir, type Locale } from "@/lib/i18n/config"
import { makeT, type TFunction } from "@/lib/i18n/translate"

interface I18nContextValue {
  locale: Locale
  dir: "rtl" | "ltr"
  t: TFunction
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const router = useRouter()
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
      document.documentElement.lang = next
      document.documentElement.dir = getDir(next)
      setLocaleState(next)
      // re-render Server Components with the new cookie
      router.refresh()
    },
    [router]
  )

  const value = useMemo<I18nContextValue>(
    () => ({ locale, dir: getDir(locale), t: makeT(locale), setLocale }),
    [locale, setLocale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider>")
  return ctx
}
