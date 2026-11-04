import { en } from './en'
import type { Locale } from './config'

export type TParams = Record<string, string | number>
export type TFunction = (key: string, params?: TParams) => string

/**
 * Same idea as Laravel's __('...') with lang/en.json:
 * the Arabic text IS the key. Arabic returns the key itself,
 * English looks it up in ./en.ts (falls back to the Arabic text if missing).
 */
export function translate(locale: Locale, key: string, params?: TParams): string {
  let text = locale === 'en' ? (en[key] ?? key) : key
  if (params) {
    text = text.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match
    )
  }
  return text
}

export function makeT(locale: Locale): TFunction {
  return (key, params) => translate(locale, key, params)
}
