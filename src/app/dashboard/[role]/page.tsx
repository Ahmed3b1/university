import { notFound } from 'next/navigation'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { ProfessorDashboard } from '@/components/dashboard/professor-dashboard'
import { StudentDashboard } from '@/components/dashboard/student-dashboard'
import { getT } from "@/lib/i18n/server"

const roleTitles: Record<string, string> = {
  admin: 'لوحة تحكم المدير',
  professor: 'لوحة تحكم الأستاذ',
  student: 'لوحة تحكم الطالب',
}

export function generateStaticParams() {
  return [
    { role: 'admin' },
    { role: 'professor' },
    { role: 'student' },
  ]
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ role: string }>
}) {
  const t = await getT()

  const { role } = await params

  let DashboardComponent

  switch (role) {
    case 'admin':
      DashboardComponent = AdminDashboard
      break
    case 'professor':
      DashboardComponent = ProfessorDashboard
      break
    case 'student':
      DashboardComponent = StudentDashboard
      break
    default:
      return notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t(roleTitles[role])}</h1>
        <p className="text-muted-foreground">{t("مرحباً بك في نظام EduLrn.")}</p>
      </div>
      <DashboardComponent />
    </div>
  )
}

