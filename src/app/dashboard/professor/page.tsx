import ProfessorDashboardContent from './ProfessorDashboardContent'
import { Suspense } from 'react'

export default function ProfessorDashboardPage() {
  return (
    <div className="container mx-auto py-10 px-4" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-primary">لوحة تحكم الأستاذ</h1>
      <Suspense fallback={<div>جاري التحميل...</div>}>
        <ProfessorDashboardContent />
      </Suspense>
    </div>
  )
}

