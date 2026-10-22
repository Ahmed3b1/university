import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import { getSession } from '@/lib/auth'
import { addGradeSchema } from '@/lib/validations'
import mongoose from 'mongoose'

export async function POST(
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

    if (session.role === 'student') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح بإضافة درجات' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const validationResult = addGradeSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => e.message)
      return NextResponse.json(
        { success: false, message: errors[0] },
        { status: 400 }
      )
    }

    const { studentId, grade, comment } = validationResult.data

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

    if (!isProfessor && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح بإضافة درجات لهذه المادة' },
        { status: 403 }
      )
    }

    if (!course.students.includes(new mongoose.Types.ObjectId(studentId))) {
      return NextResponse.json(
        { success: false, message: 'الطالب غير مسجل في هذه المادة' },
        { status: 400 }
      )
    }

    const existingGradeIndex = course.grades.findIndex(
      (g) => g.student.toString() === studentId
    )

    if (existingGradeIndex !== -1) {
      course.grades[existingGradeIndex].grade = grade
      course.grades[existingGradeIndex].comment = comment
      course.grades[existingGradeIndex].gradedAt = new Date()
    } else {
      course.grades.push({
        student: new mongoose.Types.ObjectId(studentId),
        grade,
        comment,
        gradedAt: new Date(),
      })
    }

    await course.save()

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الدرجة بنجاح'
    })

    } catch (error) {
    console.error('Add material error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

export async function GET(
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
    await dbConnect()

    const course = await Course.findById(id)
      .populate('grades.student', 'name email')
      .lean()

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'المادة غير موجودة' },
        { status: 404 }
      )
    }

    if (session.role === 'professor' || session.role === 'admin') {
      return NextResponse.json({
        success: true,
        grades: course.grades,
      })
    } 

    if (session.role === 'student') {
      const studentGrade = course.grades.find(
        (g) => (g.student as { _id: mongoose.Types.ObjectId })._id.toString() === session.userId
      )

      return NextResponse.json({
        success: true,
        grades: studentGrade ? [studentGrade] : [],
      })
    }

    return NextResponse.json({
      success: true,
      grades: [],
    })

    
    }catch (error) {
    console.error('Add material error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

