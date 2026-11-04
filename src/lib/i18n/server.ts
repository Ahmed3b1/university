import { cookies } from 'next/headers'
import { LOCALE_COOKIE, defaultLocale, isLocale, type Locale } from './config'
import { makeT, type TFunction } from './translate'

// For Server Components and API route handlers.
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const value = cookieStore.get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : defaultLocale
}

export async function getT(): Promise<TFunction> {
  return makeT(await getLocale())
}
