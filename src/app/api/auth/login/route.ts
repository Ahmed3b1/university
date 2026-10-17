import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { signToken, setAuthCookie } from '@/lib/auth'
import { verifyPassword } from '@/lib/password'
import { loginSchema } from '@/lib/validations'
import { fa } from 'zod/v4/locales'

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const attempt = loginAttempts.get(ip)

  if (!attempt) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return false
  }

  if (now - attempt.lastAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return false
  }

  if (attempt.count >= MAX_ATTEMPTS) {
    return true
  }

  attempt.count++
  attempt.lastAttempt = now 
  return false
}

export async function POST(request: Request) {
  try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        if (isRateLimited(ip)) {
        return NextResponse.json(
            { success: false, message: 'محاولات كثيرة جدا، يرجى المحاولة لاحقا' },
            { status: 429 }
        )
        }

        await dbConnect()

        const body = await request.json()

        const validationResult = loginSchema.safeParse(body)
        if (!validationResult.success) {
        const errors = validationResult.error.issues.map((e) => e.message)
        return NextResponse.json(
            { success: false, message: errors[0] },
            { status: 400 }
        )
        }

        const { email, password } = validationResult.data

        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
        return NextResponse.json(
            { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
            { status: 401 }
        )
        }

        const isValid = await verifyPassword(password, user.password)
        if (!isValid) {
        return NextResponse.json(
            { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
            { status: 401 }
        )
        }

        loginAttempts.delete(ip)
        
        const token = await signToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        })

        await setAuthCookie(token)

        return NextResponse.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        },
        })

    }catch (error) {
        
        return NextResponse.json(
        { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' },
        { status: 500 }
        )
    }
}