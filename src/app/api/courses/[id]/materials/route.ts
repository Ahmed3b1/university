import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import { getSession } from '@/lib/auth'
import { addMaterialSchema } from '@/lib/validations'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
){
  try {
    const session = await getSession()
    if(!session){
      return NextResponse.json(
        {success: false, message: "غير مسجل"},
        {status: 401}
      )
    }
    
    const { id } = await params
    await dbConnect()

    const course = await Course.findById(id)

    if(!course){
      return NextResponse.json(
        {success: false, message: "لم يتم العثور على الدورة"},
        {status: 404}
      )
    }

    if(session.role !== "admin" && course.professor.toString() !== session.userId){
      return NextResponse.json(
        {success:false, message:"غير مصرح لك"},
        {status:403}
      )
    }

    const body = await request.json()

    const validationResult = addMaterialSchema.safeParse(body)
    if(!validationResult.success){
      const errors = validationResult.error.issues.map((e) => e.message)
      return NextResponse.json(
        {success: false, message: errors[0]},
        {status: 400}
      )
    }

    course.materials.push(validationResult.data)
    await course.save()

    return NextResponse.json({
      success: true,
      message: "تم إضافة المادة التعليمية بنجاح",
      course
    })
  } catch (error) {
    console.error('Add material error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

        