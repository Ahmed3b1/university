"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/language-provider"

interface UserProfile {
    _id: string
    name: string
    email: string
    role: 'admin' | 'professor' | 'student'
}

export function ProfileForm({ user }: { user: UserProfile }) {
  const { t } = useI18n()

    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: user.name,
            email: user.email,
            password: "",
        }
    })

    const onSubmit = async (data: any) => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/profile/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await res.json()

            if (!res.ok) {
                toast.error(result.error || t("حدث خطأ أثناء التحديث"))
                return
            }

            toast.success(t("تم تحديث البيانات بنجاح"))
            router.refresh()
        } catch (error) {
            toast.error(t("حدث خطأ غير متوقع"))
        } finally {
            setIsLoading(false)
        }
    }

    const isStudent = user.role === 'student'
    const isAdmin = user.role === 'admin' 

    return(
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl mx-auto p-6 bg-card rounded-xl border shadow-sm">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t("الاسم الكامل")}</label>
                    <Input
                        {...register("name", { required: t("الاسم الكامل مطلوب"), minLength: { value: 2, message: t("يجب ألا يكون الاسم قصير جدا") } })}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
                </div>


                <div className="space-y-2">
                    <label className="text-sm font-medium">{t("البريد الإلكتروني")}</label>
                    <Input type="email"
                        {...register("email", { required: t("البريد الإلكتروني مطلوب") })}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">{t("كلمة المرور الجديدة (اختياري)")}</label>
                    <Input
                        type="password"
                        placeholder={t("اتركها فارغة إذا لم ترد التغيير")}
                        {...register("password", { minLength: { value: 8, message: t("كلمة المرور يجب أن تكون 8 أحرف على الأقل") } })}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">{t("الدور (للاطلاع فقط)")}</label>
                    <Input value={user.role === 'admin' ? t("مدير") : user.role === 'professor' ? t("أستاذ") : t("طالب")} disabled />
                </div>

            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("جاري الحفظ...") : t("حفظ التغييرات")}
            </Button>
            
        </form>
    )

}