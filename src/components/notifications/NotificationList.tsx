"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/language-provider"
import { getDateLocale } from "@/lib/i18n/config"

interface Notification {
    _id: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    isRead: boolean
    createdAt: string
}

export function NotificationList() {
  const { t, locale } = useI18n()

    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications")
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const handleMarkAsRead = async (id: string) => {
        try {
            const res = await fetch(`/api/notifications/${id}`, { method: "PUT" })
            if (res.ok) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
                toast.success(t("تم تحديث الحالة"))
            }
        } catch (error) {
            toast.error(t("حدث خطأ"))
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" })
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n._id !== id))
                toast.success(t("تم حذف الإشعار"))
            }
        } catch (error) {
            toast.error(t("حدث خطأ"))
        }
    }

    if (loading) return <div className="text-center py-8">{t("جاري التحميل...")}</div>

    if (notifications.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <Bell className="mx-auto h-12 w-12 opacity-20 mb-4" />
                <p>{t("لا توجد إشعارات حاليا")}</p>
            </div>
        )
    }

        return (
        <div className="space-y-4">
            {notifications.map((notification) => (
                <div
                    key={notification._id}
                    className={cn(
                        "flex items-start justify-between p-4 rounded-lg border transition-colors",
                        notification.isRead ? "bg-background opacity-70" : "bg-card border-primary/20 shadow-sm"
                    )}
                >
                    <div className="flex gap-4">
                        <div className={cn(
                            "mt-1 h-2 w-2 rounded-full shrink-0",
                            notification.isRead ? "bg-muted-foreground/40" : "bg-primary"
                        )} />

                        <div>
                            <p className={cn("text-sm", notification.isRead ? "text-muted-foreground" : "font-medium")}>
                                {notification.message}
                            </p>
                            <span className="text-xs text-muted-foreground mt-1 block">
                                {new Date(notification.createdAt).toLocaleDateString(getDateLocale(locale))}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {!notification.isRead && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleMarkAsRead(notification._id)}
                                title={t("تحديد كمقروء")}
                            >
                                <Check className="h-4 w-4 text-primary" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(notification._id)}
                            title={t("حذف")}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}