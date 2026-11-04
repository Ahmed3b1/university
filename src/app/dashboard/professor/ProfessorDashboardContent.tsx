'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useI18n } from "@/components/language-provider"

export default function ProfessorDashboardContent() {
  const { t } = useI18n()

  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [isViewStudentsOpen, setIsViewStudentsOpen] = useState(false)
  const [selectedCourseStudents, setSelectedCourseStudents] = useState<any[]>([])
  const [viewLoading, setViewLoading] = useState(false)


  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    semester: 'الفصل الأول',
    year: new Date().getFullYear(),
    credits: 3,
    type: 'undergraduate',
    requirements: '',
    format: '',
    image: '',
  })

  const [materialData, setMaterialData] = useState({
    title: '',
    url: '',
    type: 'lecture',
  })

  
  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
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

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (data.success) {
        toast.success(t("تم إنشاء المادة بنجاح"))
        setIsCreateOpen(false)
        fetchCourses()
        setFormData({
          title: '',
          code: '',
          description: '',
          semester: 'الفصل الأول',
          year: new Date().getFullYear(),
          credits: 3,
          type: 'undergraduate',
          requirements: '',
          format: '',
          image: '',
        })
      } else {
        toast.error(data.message || t("حدث خطأ"))
      }
    } catch (error) {
      console.error('Error creating course:', error)
      toast.error(t("حدث خطأ أثناء الاتصال بالخادم"))
    }
  }

  const openAddMaterial = (courseId: string) => {
    setSelectedCourseId(courseId)
    setIsAddMaterialOpen(true)
  }

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourseId) return
    try {
      const res = await fetch(`/api/courses/${selectedCourseId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materialData),
      })
      const data = await res.json()

      if (data.success) {
        toast.success(t("تمت إضافة المحتوى بنجاح"))
        setIsAddMaterialOpen(false)
        setMaterialData({ title: '', url: '', type: 'lecture' })
        fetchCourses()
      } else {
        toast.error(data.message || t("حدث خطأ"))
      }
    } catch (error) {
      console.error('Error adding material:', error)
      toast.error(t("حدث خطأ أثناء الاتصال بالخادم"))
    }
  }

  const openViewStudents = async (courseId: string) => {
    setSelectedCourseId(courseId)
    setIsViewStudentsOpen(true)
    setViewLoading(true)
    try {
      const res = await fetch(`/api/courses/${courseId}`)
      const data = await res.json()
      if (data.success && data.course.students) {
        setSelectedCourseStudents(data.course.students)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error(t("فشل تحميل قائمة الطلاب"))
    } finally {
      setViewLoading(false)
    }
  }


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("موادك الدراسية")}</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={<Button />}>{t("إضافة مادة جديدة")}</DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background text-foreground" dir="rtl">
            <DialogHeader>
              <DialogTitle>{t("إضافة مادة جديدة")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCourse} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label>{t("عنوان المادة")}</Label>
                    <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        minLength={3}
                    />
                    </div>
                    <div className="space-y-2">
                    <Label>{t("رمز المادة")}</Label>
                    <Input
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        required
                        placeholder="CS101"
                    />
                    </div>
              </div>

              <div className="space-y-2">
                <Label>{t("الوصف")}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>{t("الفصل")}</Label>
                        <Select
                            value={formData.semester}
                            onValueChange={(val) => { if (val) setFormData({ ...formData, semester: val }) }}
                        >
                            <SelectTrigger>
                            <SelectValue>{(value: string | null) => (value ? t(value) : "")}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="الفصل الأول">{t("الفصل الأول")}</SelectItem>
                            <SelectItem value="الفصل الثاني">{t("الفصل الثاني")}</SelectItem>
                            <SelectItem value="الفصل الصيفي">{t("الفصل الصيفي")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
              
                    <div className="space-y-2">
                    <Label>{t("السنة")}</Label>
                    <Input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        required
                    />
                    </div>
                    <div className="space-y-2">
                    <Label>{t("الساعات")}</Label>
                    <Input
                        type="number"
                        value={formData.credits}
                        onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                        required
                        min={1}
                        max={6}
                    />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>{t("نوع المادة")}</Label>
                    <Select
                    value={formData.type}
                    onValueChange={(val) => { if (val) setFormData({ ...formData, type: val }) }}
                    >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="undergraduate">{t("بكالوريوس")}</SelectItem>
                        <SelectItem value="graduate">{t("دراسات عليا")}</SelectItem>
                        <SelectItem value="online">{t("أونلاين")}</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                {formData.type === 'graduate' && (
                    <div className="space-y-2">
                    <Label>{t("المتطلبات")}</Label>
                    <Textarea
                        value={formData.requirements}
                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                        placeholder={t("متطلبات القبول أو المواد السابقة...")}
                    />
                    </div>
                )}

                {formData.type === 'online' && (
              <div className="space-y-2">
                <Label>{t("المنصة / التنسيق")}</Label>
                <Input
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  placeholder={t("مسجل، مباشر، مختلط...")}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>{t("رابط الصورة (اختياري)")}</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <Button type="submit" className="w-full">{t("إنشاء المادة")}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>

        {/* Add Material Dialog */}
      <Dialog open={isAddMaterialOpen} onOpenChange={setIsAddMaterialOpen}>
        <DialogContent className="bg-background text-foreground" dir="rtl">
          <DialogHeader>
            <DialogTitle>{t("إضافة محتوى تعليمي")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMaterial} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>{t("عنوان المحتوى")}</Label>
              <Input
                value={materialData.title}
                onChange={(e) => setMaterialData({ ...materialData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("الرابط (URL)")}</Label>
              <Input
                value={materialData.url}
                onChange={(e) => setMaterialData({ ...materialData, url: e.target.value })}
                required
                type="url"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>{t("النوع")}</Label>
              <Select
                value={materialData.type}
                onValueChange={(val) => { if (val) setMaterialData({ ...materialData, type: val }) }}
              >
                <SelectTrigger>
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="lecture">{t("محاضرة")}</SelectItem>
                    <SelectItem value="assignment">{t("واجب")}</SelectItem>
                    <SelectItem value="reading">{t("قراءة")}</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <Button type="submit" className="w-full">{t("إدراج")}</Button>
            </form>
        </DialogContent>
        </Dialog>

        {/* View Students Dialog */}
        <Dialog open={isViewStudentsOpen} onOpenChange={setIsViewStudentsOpen}>
        <DialogContent className="bg-background text-foreground" dir="rtl">
            <DialogHeader>
            <DialogTitle>{t("الطلاب المسجلين")}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {viewLoading ? (
              <div className="text-center py-4">{t("جاري التحميل...")}</div>
            ) : selectedCourseStudents.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">{t("لا يوجد طلاب مسجلين في هذه المادة")}</div>
            ) : (
              <ul className="space-y-4">
                {selectedCourseStudents.map((student: any) => (
                  <li key={student._id || student.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-semibold">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div>{t("جاري التحميل...")}</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-10 bg-muted/50 border border-dashed rounded-lg">
          <p className="text-muted-foreground">{t("لم تقم بإضافة أي مواد بعد")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.code}</CardDescription>
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded">{course.type}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>{t("الطلاب:")} {course.studentsCount}</p>
                  <p>{t(course.semester)} {course.year}</p>
                  {course.materials && (
                    <p>{t("أدوات تعليمية:")} {course.materials.length}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <div className="flex gap-2 w-full">
                  <Button variant="outline" size="sm" className="flex-1">{t("تعديل")}</Button>
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => openAddMaterial(course._id)}>
                    {t("إضافة محتوى")}
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => openViewStudents(course._id)}>
                  {t("عرض الطلاب المسجلين")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

                  




