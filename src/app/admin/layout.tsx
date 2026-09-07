import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/manrope";
import "../globals.css";
import "./admin.css";

export const metadata: Metadata = {
  title: "Управление портфолио — Ярослав",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <html lang="ru"><body className="admin-body">{children}</body></html>;
}
