"use client" 

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, GraduationCap, Users, BookOpen, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface UserSession {
  id: string
  email: string
  name: string
  role: 'admin' | 'professor' | 'student'
}

export default function Home(){
  const [user ,setUser] = useState(null)
  const [isLoading , setIsLoading] = useState(true)

  useEffect(()=>{
    async function fetchUser(){
      try{
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if(data.success){
          setUser(data.user)
        }
      }catch{

      }
      setIsLoading(false)
    }
    fetchUser()
  },[])

  return(
    <div className="flex flex-col items-center justify-center space-y-12 py-12 md:py-24">
      <div className="text-center space-y-4 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl bg-clip-text text-transparent
        bg-linear-to-l from-indigo-500 via-purple-500 to-pink-500">
          مستقبل إدارة الجامعات
        </h1>
        <p className="text-xl text-muted-foreground">
          EduCore منصة اختر دورك أدناه لاستكشاف لوحة التحكم.
        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
        {[
          {
            title: "المدير / العميد",
            role: "admin",
            icon: GraduationCap,
            description: "مراقبة الجامعات والتسجيل والإيرادات ومؤشرات الأداء.",
            color: "text-indigo-500"
          },
          {
            title: "الأستاذ",
            role: "professor",
            icon: Users,
            description: "إدارة المواد وتتبع تقدم الطلاب وتقييم الواجبات.",
            color: "text-purple-500"
          },
          {
            title: "الطالب",
            role: "student",
            icon: BookOpen,
            description: "عرض الجداول والدرجات وإدارة الحياة الأكاديمية.",
            color: "text-pink-500"
          }
        ].map((item)=>(
          <Link key={item.role} href={`/dashboard/${item.role}`} className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-xl
            hover:-translate-y-1 border-primary/10 hover:border-primary/30 ">
              <CardHeader>
                <item.icon className={`w-12 h-12 mb-4 ${item.color}`} />
                <CardTitle className="text-2xl">{item.title}</CardTitle>
                <CardDescription >{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full group-hover:bg-primary/90" variant="secondary">
                  دخول لوحة التحكم <ArrowLeft className="mr-2 w-4 h-4 transition-transform
                  group-hover:-translate-x-1" />
                </Button>
              </CardContent>

            </Card>
          </Link>
        ))}

      </div>

      <div className="flex gap-4 mt-8">
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : user ?(
          <Link href={`/dashboard/${user.role}`}>
            <Button variant="secondary" size="lg">
              لوحة التحكم
            </Button>
          </Link>
        ) : (
          <>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                تسجيل الدخول
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg">
                إنشاء حساب جديد
              </Button>
            </Link>
          </>
        )}
      </div>

    </div>
  )
}