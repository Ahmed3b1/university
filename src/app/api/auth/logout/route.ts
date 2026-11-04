import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'
import { getT } from "@/lib/i18n/server"

export async function POST() {
  const t = await getT()

  try {
    await clearAuthCookie()

    return NextResponse.json({
      success: true,
      message: t("تم تسجيل الخروج بنجاح"),
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, message: t("حدث خطأ أثناء تسجيل الخروج") },
      { status: 500 }
    )
  }
}