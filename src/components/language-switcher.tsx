"use client"

import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/language-provider"

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n()
  const next = locale === "ar" ? "en" : "ar"

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => setLocale(next)}
      aria-label={t("تغيير اللغة")}
    >
      <Languages className="h-4 w-4" />
      <span lang={next} className="text-sm font-medium">
        {next === "en" ? "EN" : "عربي"}
      </span>
    </Button>
  )
}
