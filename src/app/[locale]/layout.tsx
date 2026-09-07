import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import "@fontsource-variable/manrope";
import "../globals.css";
import { isLocale, locales } from "@/content/portfolio";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export default async function RootLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <html lang={locale}><body>{children}</body></html>;
}
