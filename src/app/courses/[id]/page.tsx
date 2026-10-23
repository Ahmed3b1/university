'use client'

import { useEffect, useState, use } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface CourseDetails {
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
  type: string
  requirements?: string
  schedule?: string
  learningOutcomes?: string[]
  format?: string
  materials: { title: string; url: string; type: string }[]
  image?: string
}

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [course, setCourse] = useState<CourseDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${id}`)
        const data = await res.json()
        if (data.success) {
          setCourse(data.course)
        } else {
          setError(data.message || 'المادة غير موجودة')
        }
      } catch (err) {
        console.error('Error fetching course:', err)
        setError('حدث خطأ أثناء تحميل تفاصيل المادة')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchCourse()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4" dir="rtl">
        <div className="space-y-4">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-75 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="container mx-auto py-20 px-4 text-center" dir="rtl">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-lg mx-auto border border-red-100">
          <h2 className="text-2xl font-bold mb-2">خطأ</h2>
          <p>{error || 'لم يتم العثور على المادة'}</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/courses">العودة للمواد</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-8" dir="rtl">
      <div className="relative rounded-2xl overflow-hidden bg-primary/5 min-h-75 flex flex-col justify-end p-8 md:p-12 border border-primary/10">
        {course.image && (
          <div className="absolute inset-0 z-0 opacity-20">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className="bg-white/50 backdrop-blur">
              {course.code}
            </Badge>
            <Badge
              className={`${
                course.type === 'undergraduate'
                  ? 'bg-blue-600'
                  : course.type === 'graduate'
                  ? 'bg-purple-600'
                  : 'bg-green-600'
              }`}
            >
              {course.type === 'undergraduate'
                ? 'بكالوريوس'
                : course.type === 'graduate'
                ? 'دراسات عليا'
                : 'اونلاين'}
            </Badge>
            <Badge variant="secondary">{course.credits} ساعات معتمدة</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
            {course.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-700 text-lg font-medium">
            <span className="flex items-center gap-1">
              <span>{course.professor?.name}</span>
            </span>
            <span>•</span>
            <span>
              {course.semester} {course.year}
            </span>
          </div>
        </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                    <CardTitle>عن المادة</CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-700 leading-relaxed text-lg">
                        {course.description}
                    </CardContent>
                </Card>

                {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                    <Card>
                    <CardHeader>
                        <CardTitle>مخرجات التعلم</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {course.learningOutcomes.map((outcome, idx) => (
                            <li key={idx}>{outcome}</li>
                        ))}
                        </ul>
                    </CardContent>
                    </Card>
                )}

                {course.materials.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>المواد التعليمية</CardTitle>
                            <CardDescription>المحاضرات والملفات المتاحة</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                            {course.materials.map((material, idx) => (
                                    <div
                                    key={idx}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">
                                            {material.type === 'lecture'
                                                ? '🎥'
                                                : material.type === 'assignment'
                                                ? '📝'
                                                : '📁'}
                                            </span>
                                            <div>
                                            <p className="font-semibold">{material.title}</p>
                                            <p className="text-xs text-gray-500 capitalize">
                                                {material.type}
                                            </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a
                                            href={material.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            >
                                            عرض / تحميل
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    ) : (
                        <Card>
                        <CardHeader>
                            <CardTitle>المواد التعليمية</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-gray-500 py-8">
                            <p>لا توجد مواد تعليمية متاحة حالياً</p>
                        </CardContent>
                        </Card>
                )}
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
            <Card>
                <CardHeader>
                <CardTitle>معلومات إضافية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                {course.schedule && (
                    <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">الموعد</span>
                    <span className="font-medium">{course.schedule}</span>
                    </div>
                )}
                {course.requirements && (
                    <div className="py-2 border-b">
                    <span className="text-gray-500 block mb-1">المتطلبات</span>
                    <span className="block font-medium text-amber-600">
                        {course.requirements}
                    </span>
                    </div>
                )}
                {course.format && (
                    <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">التسجيل</span>
                    <span className="font-medium">{course.format}</span>
                    </div>
                )}
                <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">الطلاب المسجلين</span>
                    <span className="font-medium">{course.studentsCount}</span>
                </div>
                </CardContent>
                <CardFooter>
                <Button className="w-full text-lg py-6">التسجيل في المادة</Button>
                </CardFooter>
            </Card>
            
            {/* Professor Info */}
            <Card>
                <CardHeader>
                <CardTitle>مدرس المادة</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                    {course.professor?.name?.[0]}
                </div>
                <div>
                    <p className="font-bold">{course.professor?.name}</p>
                    <p className="text-xs text-gray-500">
                    {course.professor?.email}
                    </p>
                </div>
                </CardContent>
            </Card>
            </div>
        </div>
    </div>
  )
}


            

            


