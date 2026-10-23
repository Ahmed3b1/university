import { Suspense } from 'react'
import StudentDashboardContent from './StudentDashboardContent'

export default function StudentDashboardPage() {
  return (
    <div className="container mx-auto py-10 px-4" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-primary">لوحة تحكم الطالب</h1>
      <Suspense fallback={<div>جاري التحميل...</div>}>
        <StudentDashboardContent />
      </Suspense>
    </div>
  )
}

