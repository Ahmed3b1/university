import { ProfileForm } from "@/components/profile/ProfileForm"
import { getSession } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { redirect } from "next/navigation"
import { getT } from "@/lib/i18n/server"

export default async function ProfilePage() {
  const t = await getT()

  const session = await getSession()
  if (!session) redirect("/login")

  await dbConnect()
  const user = await User.findById(session.userId).select("-password").lean()

  if (!user) redirect("/login")

  const serializedUser = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand">
          {t("البيانات الشخصية")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("إدارة معلومات حسابك الشخصي")}
        </p>
      </div>

      <ProfileForm user={serializedUser as any} />
    </div>
  )
}