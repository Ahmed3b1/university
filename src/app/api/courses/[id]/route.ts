import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'

export async function GET(
  request: Request,
  {params}: {params: Promise<{id:string}>}
){
  try {
    const { id } = await params
    await dbConnect()

    const course = await Course.findById(id)
      .populate("professor", "name email")
      .populate("students", "name email")
      .lean()

    if(!course){
      return NextResponse.json(
        {success:false, message:"لم يتم العثور على الدورة"},
        {status:404}
      )
    }

    return NextResponse.json({
      success: true,
      course: {
        ...course,
        id: course._id.toString(),
        _id: undefined
      }
    })
  } catch (error) {
    console.error('Get course details error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

    