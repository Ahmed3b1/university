"use client"

import { Suspense } from 'react'
import CoursesList from '@/components/courses/CoursesList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useI18n } from "@/components/language-provider"

export default function OnlineLearningPage() {
  const { t } = useI18n()

  return (
    <div className="container mx-auto py-10 px-4" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div className="text-center md:text-start">
          <h1 className="text-4xl font-bold mb-4 text-primary">{t("التعلم عن بعد")}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {t("تعلم من أي مكان وفي أي وقت مع برامجنا التعليمية عبر الإنترنت")}
          </p>
        </div>
        <Button size="lg" className="hidden md:flex" nativeButton={false} render={<Link href="/dashboard/professor" />}>{t("لوحة الأستاذ / إدارة المواد")}</Button>
      </div>

      <Suspense fallback={<div className="text-center">{t("جاري التحميل...")}</div>}>
        <CoursesList type="online" />
      </Suspense>

      <div className="mt-16 bg-muted/50 rounded-2xl p-8 md:p-12 text-center md:text-start flex flex-col md:flex-row items-center justify-between gap-8 border border-border">
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground">{t("لماذا تختار التعلم عن بعد؟")}</h2>
          <ul className="space-y-2 text-muted-foreground list-disc list-inside">
            <li>{t("مرونة في الوقت والمكان")}</li>
            <li>{t("محتوى تعليمي تفاعلي")}</li>
            <li>{t("تواصل مباشر مع الأساتذة")}</li>
            <li>{t("شهادات معتمدة دوليا")}</li>
          </ul>
        </div>
        <Button size="lg" variant="default">
          {t("سجل الآن")}
        </Button>
      </div>
    </div>
  )
}