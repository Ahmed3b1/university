'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from "@/components/language-provider"

interface Course {
    id: string
    title: string
    description: string
    code: string
    professor: {
        name: string
        email: string
    }
    studentsCount: number
    semester: string
    year: number
    credits: number
    type: 'undergraduate' | 'graduate' | 'online'
    requirements?: string
    format?: string
    image?: string
}

interface CoursesListProps {
    type?: 'undergraduate' | 'graduate' | 'online'
}

export default function CoursesList({ type }: CoursesListProps) {
  const { t } = useI18n()

    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const params = new URLSearchParams()
                if (type) {
                    params.append('type', type)
                }

                params.append('browse', 'true')

                const res = await fetch(`/api/courses?${params.toString()}`)
                const data = await res.json()
                if (data.success) {
                    setCourses(data.courses)
                }
            } catch (error) {
                console.error('Error fetching courses:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchCourses()
    }, [type])

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-50 w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-62.5" />
                            <Skeleton className="h-4 w-50" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (courses.length === 0) {
        return (
            <div className="text-center py-20 bg-muted/50 rounded-lg border border-dashed border-border">
                <p className="text-xl text-muted-foreground">{t("لا توجد مواد دراسية متاحة حالياً في هذا القسم.")}</p>
            </div>
        )
    }

    return(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {courses.map((course) => (
                <Card
                key={course.id}
                className='flex flex-col hover:shadow-lg transition-shadow duration-300'
                >
                <div className='h-48 bg-primary/5 relative overflow-hidden rounded-t-xl group'>
                    {course.image ? (
                    <img
                        src={course.image}
                        alt={course.title}
                        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                    />
                    ) : (
                    <div className='flex items-center justify-center h-full text-primary/20'>
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                        </svg>
                    </div>
                    )}

                    <div className='absolute top-2 end-2 flex gap-2'>
                    <span className='bg-background/80 backdrop-blur px-2 py-1 text-xs font-bold rounded text-primary border border-border shadow-sm'>
                        {course.code}
                    </span>

                    {course.type === "online" && (
                        <span className='bg-primary/15 text-primary px-2 py-1 text-xs font-bold rounded border border-primary/30 shadow-sm'>
                        {t("أونلاين")}
                        </span>
                    )}
                    </div>
                </div>

                <CardHeader>
                    <CardTitle className='line-clamp-1'>{course.title}</CardTitle>
                    <CardDescription className='line-clamp-2 min-h-10'>
                    {course.description || t("لا يوجد وصف متاح")}
                    </CardDescription>
                </CardHeader>

                <CardContent className='grow space-y-2 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-2'>
                    <span className="w-4 text-center">👨‍🏫</span>
                    <span>{course.professor?.name || t("غير محدد")}</span>
                    </div>

                    <div className='flex items-center gap-2'>
                    <span className="w-4 text-center">📅</span>
                    <span>{t(course.semester)} - {course.year}</span>
                    </div>

                    <div className='flex items-center gap-2'>
                        <span className="w-4 text-center">🎓</span>
                        <span>{course.credits} {t("ساعات معتمدة")}</span>
                    </div>

                    {course.requirements && (
                    <div className='flex items-center gap-2 text-amber-600'>
                        <span className="w-4 text-center">⚠️</span>
                        <span className="line-clamp-1" title={course.requirements}>
                        {t("متطلبات:")} {course.requirements}
                        </span>
                    </div>
                    )}
                </CardContent>
                <CardFooter className="pt-4 border-t border-border mt-auto">
                    <Button className="w-full" variant="outline" nativeButton={false} render={<Link href={`/courses/${course.id}`} />}>{t("عرض التفاصيل")}</Button>
                </CardFooter>

                </Card>
            ))}
        </div>
    )
}