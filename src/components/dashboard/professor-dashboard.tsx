"use client"

import * as React from "react"
import useSWR from "swr"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, MoreVertical, Plus, Loader2 } from "lucide-react"
import { fetcher } from "@/lib/api"
import { CourseCard } from "@/components/courses/course-card"
import { toast } from "sonner"
import { useI18n } from "@/components/language-provider"

interface Course {
  id: string
  title: string
  code: string
  description: string
  professor: { _id: string; name: string }
  studentsCount: number
  semester: string
  year: number
  credits: number
}

export function ProfessorDashboard() {
  const { t } = useI18n()

  const { data, isLoading } = useSWR<{ courses: Course[] }>("/api/courses", fetcher)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("موادي")}</h2>
        <Button onClick={() => toast.info(t("سيتم إضافة ميزة إنشاء مادة قريبا"))} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("إنشاء مادة جديدة")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2
          className="w-8 h-8 animate-spin text-primary" /></div>
      ) : data?.courses && data.courses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.courses.map((course) => (
            <CourseCard key={course.id} course={course} role="professor" />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
            <h3 className="text-lg font-medium">{t("لم تقم بإنشاء أي مواد بعد")}</h3>
            <p className="text-muted-foreground mt-2">
            {t("ابدأ بإنشاء مادتك الأولى.")}
            </p>
        </div>
        )}

        <Card className="glass-card mt-8">
            <CardHeader>
                <CardTitle>{t("سجل الدرجات - عرض سريع")}</CardTitle>
                <CardDescription>{t("الطلاب الذين يحتاجون إلى تقييم.")}</CardDescription>
            </CardHeader>

            <CardContent>
                <p className="text-muted-foreground text-center py-8">
                {t("لا توجد بيانات متاحة حاليا.")}
                </p>
            </CardContent>
        </Card>
    </div>
  )
}