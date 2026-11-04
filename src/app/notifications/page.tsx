import { NotificationList } from "@/components/notifications/NotificationList"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getT } from "@/lib/i18n/server"

export default async function NotificationsPage() {
  const t = await getT()

  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand">
            {t("الإشعارات")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("آخر التحديثات والتنبيهات")}
          </p>
        </div>
      </div>

      <NotificationList />
    </div>
  )
}