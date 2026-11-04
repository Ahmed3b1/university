import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import CampusEvent from '@/models/CampusEvent'
import { getSession } from '@/lib/auth'
import { createCampusEventSchema } from '@/lib/validations'
import { getT } from "@/lib/i18n/server"

export async function GET() {
  try {
    await dbConnect()
    const events = await CampusEvent.find().sort({ date: -1 }).lean()
    return NextResponse.json({ success: true, events })
  } catch (err) {
    console.error("Get campus events error:", err)
    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const t = await getT()

  try {
        const session = await getSession()
        if (!session) {
        return NextResponse.json(
            { success: false, message: t("غير مصرح") },
            { status: 401 }
        )
        }

        if (session.role === "student") {
        return NextResponse.json(
            { success: false, message: t("غير مصرح") },
            { status: 403 }
        )
        }

        await dbConnect()
        const body = await request.json()
        const validationResult = createCampusEventSchema.safeParse(body)
        if (!validationResult.success) {
        const errors = validationResult.error.issues.map((e) => t(e.message))
        return NextResponse.json(
            { success: false, message: errors[0] },
            { status: 400 }
        )
        }
        
            const event = await CampusEvent.create(validationResult.data)

            return NextResponse.json({
            success: true,
            message: t("تم إنشاء الفعالية بنجاح"),
            event,
            })
    } catch (error) {
            console.error('Create campus event error:', error)
            return NextResponse.json(
            { success: false, message: t("حدث خطأ") },
            { status: 500 }
            )
    }
}    
  
