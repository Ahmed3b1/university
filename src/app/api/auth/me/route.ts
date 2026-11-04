import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getT } from "@/lib/i18n/server"

export async function GET() {
  const t = await getT()

  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, message: t("غير مصرح") },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    })
  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json(
      { success: false, message: t("حدث خطأ") },
      { status: 500 }
    )
  }
}