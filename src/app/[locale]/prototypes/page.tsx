import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/content/portfolio";

export default async function PrototypesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  redirect(`/${locale}`);
}
