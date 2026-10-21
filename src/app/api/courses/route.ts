import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Course from "@/models/Course"
import { getSession } from "@/lib/auth"
import { createCourseSchema } from "@/lib/validations"

export async function GET(request: Request) {
  try {
    const session = await getSession()

    await dbConnect()

    const url = new URL(request.url)
    const browse = url.searchParams.get("browse") === "true"
    const type = url.searchParams.get("type")

    let query:any = {}

    if(type){
      query.type = type
    }

    if(session){
      if(session.role === "professor" && browse && !type){
        query.professor = session.userId
      }else if(session.role === "student" && browse && !type){
        query.students = session.userId
      }
    }

    const courses = await Course.find(query)
      .populate("professor", "name email")
      .populate("students", "name email")
      .sort({createdAt:-1})
      .lean()

        return NextResponse.json({
        success: true,
        courses: courses.map((course) => ({
                id: course._id.toString(),
                title: course.title,
                description: course.description,
                code: course.code,
                professor: course.professor,
                studentsCount: course.students.length,
                semester: course.semester,
                year: course.year,
                credits: course.credits,
                type: course.type,
                requirements: course.requirements,
                format: course.format,
                materials: course.materials,
                image: course.image,
                myGrade: session?.role === 'student'
                ? course.grades.find((g: any) => g.student.toString() === session.userId)?.grade
                : undefined
            }))
        })
   
  } catch (error) { 
    console.error("Course Retrieval Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء استرجاع الدورات"
      },
      { status: 500 }
    );
  }
}

export async function POST(request:Request){
  try{
    const session = await getSession()

    if(!session){
      return NextResponse.json(
        {success: false, message:"غير مسجل"},
        {status:401}
      )
    }

    if(session.role === "student"){
      return NextResponse.json(
        {success:false, message:"غير مصرح لك"},
        {status:403}
      )
    }

    await dbConnect()

    const body = await request.json()

    const validationResult = createCourseSchema.safeParse(body)
    if(!validationResult.success){
      const errors = validationResult.error.issues.map((e) => e.message)
      return NextResponse.json(
        {success: false, message: errors[0]},
        {status: 400}
      )
    }

    const { title, description, code, semester
      , year, credits, type, requirements
      , format, image} = validationResult.data

    const existingCourse = await Course.findOne({code: code.toUpperCase()})

    if(existingCourse){
      return NextResponse.json(
        {success: false, message: "رمز المادة موجود بالفعل"},
        {status: 400}
      )
    }

    const professorId = session.role === "admin" ? (session.userId) : session.userId

    const course = await Course.create({
      title,
      description: description || '',
      code: code.toUpperCase(),
      professor: professorId,
      semester,
      year,
      credits,
      type,
      requirements,
      format,
      image,
      students: [],
      grades: [],
      materials: [],
    })

    return NextResponse.json({
      success: true,
      message: "تم إنشاء المادة بنجاح",
      course: {
        id: course._id.toString(),
        title: course.title,
        code: course.code,
      }
    })
  } catch (error) {
    console.error('Create course error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

