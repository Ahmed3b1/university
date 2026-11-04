import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import { getSession } from '@/lib/auth'
import { addMaterialSchema } from '@/lib/validations'
import { getT } from "@/lib/i18n/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
){
  const t = await getT()

  try {
    const session = await getSession()
    if(!session){
      return NextResponse.json(
        {success: false, message: t("غير مسجل")},
        {status: 401}
      )
    }
    
    const { id } = await params
    await dbConnect()

    const course = await Course.findById(id)

    if(!course){
      return NextResponse.json(
        {success: false, message: t("لم يتم العثور على الدورة")},
        {status: 404}
      )
    }

    if(session.role !== "admin" && course.professor.toString() !== session.userId){
      return NextResponse.json(
        {success:false, message:t("غير مصرح لك")},
        {status:403}
      )
    }

    const body = await request.json()

    const validationResult = addMaterialSchema.safeParse(body)
    if(!validationResult.success){
      const errors = validationResult.error.issues.map((e) => t(e.message))
      return NextResponse.json(
        {success: false, message: errors[0]},
        {status: 400}
      )
    }

    course.materials.push(validationResult.data)
    await course.save()

    return NextResponse.json({
      success: true,
      message: t("تم إضافة المادة التعليمية بنجاح"),
      course
    })
  } catch (error) {
    console.error('Add material error:', error)
    return NextResponse.json(
      { success: false, message: t("حدث خطأ") },
      { status: 500 }
    )
  }
}

        