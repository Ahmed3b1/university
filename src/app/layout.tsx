import type { Metadata } from "next";
import { Noto_Sans_Arabic, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import { getDir } from "@/lib/i18n/config";
import { getLocale, getT } from "@/lib/i18n/server";

// Arabic font
const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

// Latin font (used when the language is English)
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("EduLrn - نظام إدارة الجامعة"),
    description: t("نظام إدارة جامعي متكامل للطلاب والأساتذة والإدارة."),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} dir={getDir(locale)} suppressHydrationWarning>
      <body
        className={`${notoSansArabic.variable} ${spaceGrotesk.variable} antialiased min-h-screen bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider initialLocale={locale}>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 w-full max-w-350 mx-auto px-4 md:px-6 py-6">
                {children}
              </main>
            </div>
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
