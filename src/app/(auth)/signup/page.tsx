'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { GraduationCap, Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signupSchema, SignupInput } from "@/lib/validations"

const roles = [
  { value: "student", label: "طالب" },
  { value: "professor", label: "أستاذ" },
  { value: "admin", label: "مدير" },
]

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true)

  React.useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if (data.success) {
          router.replace("/")
          return
        }
      } catch {

      }
      setIsCheckingAuth(false)
    }
    checkAuth()
  }, [router])

    const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
    },
  })

  const onSubmit = async (data: SignupInput) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

            const result = await res.json()

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success("تم إنشاء الحساب بنجاح")
      router.push(`/dashboard/${result.user.role}`)
    } catch {
      toast.error("حدث خطأ غير متوقع")
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

    return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card border-primary/10">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-primary p-3 rounded-xl w-fit">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
              <CardDescription className="mt-2">
                أنشئ حسابك للوصول إلى نظام إدارة الجامعة
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  الاسم الكامل
                </label>

              </div>

            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )


}