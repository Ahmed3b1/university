import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getSession } from '@/lib/auth'
import { hashPassword } from '@/lib/password'

export async function GET() {
  try {
        const session = await getSession()
        if (!session) {
        return NextResponse.json(
            { success: false, message: "" },
            { status: 401 }
        )
        }

        if (session.role !== "admin") {
        return NextResponse.json(
            { success: false, message: "" },
            { status: 403 }
        )
        }

        await dbConnect()
        
            const users = await User.find({})
            .select("-password")
            .sort({ createdAt: -1 })
            .lean()

            return NextResponse.json({
            success: true,
            users: users.map((user) => ({
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
            })),
            })
    } catch (error) {
            console.error("Get users error:", error)
            return NextResponse.json(
            { success: false, message: "حدث خطأ" },
            { status: 500 }
            )
    }

}

export async function POST(request: Request) {
  try {
        const session = await getSession()
        if (!session) {
        return NextResponse.json(
            { success: false, message: "" },
            { status: 401 }
        )
        }

        if (session.role !== "admin") {
        return NextResponse.json(
            { success: false, message: "" },
            { status: 403 }
        )
        }

        await dbConnect()

        const { email, password, name, role } = await request.json()

        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
              return NextResponse.json(
                { success: false, message: 'البريد الإلكتروني مستخدم بالفعل' },
                { status: 400 }
            )
            }

            const hashedPassword = await hashPassword(password)

            const user = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            role,
            })

            return NextResponse.json({
            success: true,
            message: 'تم إنشاء المستخدم بنجاح',
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
            },
            })
        } catch (error) {
            console.error('Create user error:', error)
            return NextResponse.json(
            { success: false, message: 'حدث خطأ' },
            { status: 500 }
            )
        }
}
            
