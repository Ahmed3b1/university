import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getT } from "@/lib/i18n/server"

export async function GET() {
  const t = await getT()

  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findById(session.userId).select('-password')

    if (!user) {
      return NextResponse.json({ error: t("المستخدم غير موجود") }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: t("حدث خطأ أثناء جلب البيانات") }, { status: 500 })
  }
}