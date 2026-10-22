import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import { getSession } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
){
  try {
    const session = getSession()
    if(!session){
      return NextResponse.json(
        {success:false, message:""},
        {status:401}
      )
    }
    
    const { id } = await params
    const { studentId } = await request.json()

    await dbConnect()

    const course = await Course.findById(id)

    if(!course){
      return NextResponse.json(
        {success:false, message:""},
        {status:404}
      )
    }

    const isProfessor = course.professor.toString() === session.userId
    const isAdmin = session.role === 'admin'

    const isSelfEnroll = session.role === 'student' && session.userId === studentId

    if (!isProfessor && !isAdmin && !isSelfEnroll) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح بتسجيل الطلاب' },
        { status: 403 }
      )
    }

    if (course.students.includes(studentId)) {
      return NextResponse.json(
        { success: false, message: 'الطالب مسجل بالفعل في هذه المادة' },
        { status: 400 }
      )
    }
    
    course.students.push(studentId)
    await course.save()

    return NextResponse.json({
      success: true,
      message: "تم تسجيل الطالب بنجاح"
    })
  } catch(err){
    console.error("Enroll student error:", err)
    return NextResponse.json(
      {success:false, message:""},
      {status:500}
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { studentId } = await request.json()
    await dbConnect()

    const course = await Course.findById(id)

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'المادة غير موجودة' },
        { status: 404 }
      )
    }

    const isProfessor = course.professor.toString() === session.userId
    const isAdmin = session.role === 'admin'
    const isSelfUnenroll = session.role === 'student' && session.userId === studentId

    if (!isProfessor && !isAdmin && !isSelfUnenroll) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح بإلغاء تسجيل الطلاب' },
        { status: 403 }
      )
    }

    course.students = course.students.filter((s) => s.toString() !== studentId)
    await course.save()

    return NextResponse.json({
      success: true,
      message: 'تم إلغاء تسجيل الطالب بنجاح'
    })
  } catch (err) {
    console.error('Enroll student error:', err)
    return NextResponse.json(
      { success: false, message: '' },
      { status: 500 }
    )
  }
}

    
