"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/content/portfolio";

export function ProjectsRetry({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button type="button" disabled={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? (locale === "ru" ? "Загружаем…" : "Loading…") : (locale === "ru" ? "Попробовать снова ↗" : "Try again ↗")}</button>;
}
