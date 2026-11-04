export const locales = ['ar', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'ar'
export const LOCALE_COOKIE = 'edulrn-locale'

export function isLocale(value: unknown): value is Locale {
  return value === 'ar' || value === 'en'
}

export function getDir(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

// Locale used for Intl / toLocaleDateString
export function getDateLocale(locale: Locale): string {
  return locale === 'ar' ? 'ar-EG' : 'en-US'
}
