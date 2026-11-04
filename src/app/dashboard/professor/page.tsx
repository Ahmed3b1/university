import ProfessorDashboardContent from './ProfessorDashboardContent'
import { Suspense } from 'react'
import { getT } from "@/lib/i18n/server"

export default async function ProfessorDashboardPage() {
  const t = await getT()

  return (
    <div className="container mx-auto py-10 px-4" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-primary">{t("لوحة تحكم الأستاذ")}</h1>
      <Suspense fallback={<div>{t("جاري التحميل...")}</div>}>
        <ProfessorDashboardContent />
      </Suspense>
    </div>
  )
}

