import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getSession } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
    ) {
        try {
                const session = await getSession()
                if (!session) {
                return NextResponse.json(
                    { success: false, message: "غير مصرح" },
                    { status: 401 }
                )
                }

                const { id } = await params

                if (session.userId !== id && session.role !== "admin") {
                return NextResponse.json(
                    { success: false, message: "غير مصرح بالدخول" },
                    { status: 403 }
                )
                }
                    await dbConnect()

                    const user = await User.findById(id).select("-password").lean()
                    if (!user) {
                    return NextResponse.json(
                        { success: false, message: "المستخدم غير موجود" },
                        { status: 404 }
                    )
                    }

                    return NextResponse.json({
                    success: true,
                    user: {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        createdAt: user.createdAt,
                    },
                    })
                } catch (err) {
                    return NextResponse.json(
                    { success: false, message: "حدث خطأ" },
                    { status: 500 }
                    )
                }
        }


export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
        const session = await getSession()
        if (!session) {
        return NextResponse.json(
            { success: false, message: "غير مصرح" },
            { status: 401 }
        )
        }

        const { id } = await params
        if (session.userId !== id && session.role !== "admin") {
        return NextResponse.json(
            { success: false, message: "غير مصرح بالدخول" },
            { status: 403 }
        )
        }

        await dbConnect()
        const { name, email, role } = await request.json()
        const updateData: Record<string, string> = {}
        if (name) updateData.name = name
        if (email) updateData.email = email.toLowerCase()
        if (role && session.role === "admin") updateData.role = role

        const user = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
        }).select("-password")

        if (!user) {
            return NextResponse.json(
                { success: false, message: "المستخدم غير موجود" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "تم تحديث بيانات المستخدم بنجاح",
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
            }
        })
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ" },
            { status: 500 }
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
        { success: false, message: "غير مصرح" },
        { status: 401 }
      )
    }

    if (session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 403 }
      )
    }
    
    const { id } = await params

    if (session.userId === id) {
      return NextResponse.json(
        { success: false, message: "غير مصرح بالحذف" },
        { status: 400 }
      )
    }

    await dbConnect()

    const user = await User.findByIdAndDelete(id)

        if (!user) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({
        success: true,
        message: 'تم حذف المستخدم بنجاح',
        })
    } catch (error) {
        console.error('Delete user error:', error)
        return NextResponse.json(
        { success: false, message: 'حدث خطأ' },
        { status: 500 }
        )
    }
}