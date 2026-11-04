import { Suspense } from 'react'
import CoursesList from '@/components/courses/CoursesList'
import { getT } from "@/lib/i18n/server"

export default async function UndergraduatePage() {
  const t = await getT()

  return (
    <div className="container mx-auto py-10 px-4" dir="rtl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-primary">{t("برامج البكالوريوس")}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("استكشف مجموعة متنوعة من التخصصات المصممة لبناء مستقبلك المهني")}
        </p>
      </div>

      <Suspense fallback={<div className="text-center">{t("جاري التحميل...")}</div>}>
        <CoursesList type="undergraduate" />
      </Suspense>
    </div>
  )
}

