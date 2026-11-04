import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import { getSession } from '@/lib/auth'
import { createCourseSchema } from '@/lib/validations'
import { getT } from "@/lib/i18n/server"

export async function GET() {
  const t = await getT()

  try {
    await dbConnect()
    const courses = await Course.find({ type: "online" })
      .populate("professor", "name email")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      courses: courses.map(course => ({
        id: course._id.toString(),
        title: course.title,
        description: course.description,
        code: course.code,
        professor: course.professor,
        credits: course.credits,
        image: course.image,
      })),
    })
    
  } catch (err) {
    console.error("Get online courses error:", err)
    return NextResponse.json(
      { success: false, message: t("حدث خطأ أثناء جلب الدورات") },
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
    
    body.type = "online"

    const validationResult = createCourseSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => t(e.message))

      return NextResponse.json(
        { success: false, message: t("بيانات الدورة غير صحيحة") },
        { status: 400 }
      )
    }

    const { code } = validationResult.data

    const existingUser = await Course.findOne({ code: code.toUpperCase() })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: t("رمز الدورة موجود بالفعل") },
        { status: 400 }
      )
    }
    
    const course = await Course.create({
      ...validationResult.data,
      code: code.toUpperCase(),
      professor: session.userId,
      students: [],
      grades: [],
      materials: [],
    })

    return NextResponse.json({
      success: true,
      message: t("تم إنشاء الدورة بنجاح"),
      course: {
        id: course._id.toString(),
        title: course.title,
      },
    })
  } catch (error) {
    console.error("Create online course error:", error)
    return NextResponse.json(
      { success: false, message: t("حدث خطأ أثناء إنشاء الدورة") } ,
      {status: 500 }
    )
  }
}