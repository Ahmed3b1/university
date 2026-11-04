'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useI18n } from "@/components/language-provider"
import { getDateLocale } from "@/lib/i18n/config"

interface CampusEvent {
  _id: string
  title: string
  description: string
  date: string
  location: string
  image?: string
}

export default function CampusEventsList() {
  const { t, locale } = useI18n()

  const [events, setEvents] = useState<CampusEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/campus')
        const data = await res.json()
        if (data.success) {
          setEvents(data.events)
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return <div className="text-center py-20">{t("جاري تحميل الفعاليات...")}</div>
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/50 rounded-lg">
        <p className="text-xl text-muted-foreground">{t("لا توجد فعاليات حالياً، ترقبوا المزيد قريباً!")}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event) => (
        <div key={event._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-border">
          <div className="relative h-48 bg-muted">
            {event.image ? (
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground/70">
                <span>{t("لا توجد صورة")}</span>
              </div>
            )}
            <div className="absolute top-4 start-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary shadow-sm">
              {new Date(event.date).toLocaleDateString(getDateLocale(locale))}
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-foreground line-clamp-1">{event.title}</h3>
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <svg className="w-4 h-4 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.location}</span>
            </div>
            <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
              {event.description}
            </p>
            <button className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium py-2 rounded-lg transition-colors duration-200">
              {t("المزيد من التفاصيل")}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}


