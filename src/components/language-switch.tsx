"use client";

import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/content/portfolio";

export function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  function navigate(event: MouseEvent<HTMLAnchorElement>, target: Locale) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const sections = ["hero", "about", "projects", "contact"];
    const active = sections.reduce((current, id) => {
      const element = document.getElementById(id);
      return element && element.getBoundingClientRect().top <= window.innerHeight * 0.4 ? id : current;
    }, "hero");
    router.push(`/${target}${active === "hero" ? "" : `#${active}`}`);
  }

  return <nav className="language-switch" aria-label={label}>{(["ru", "en"] as const).map((language) => <a key={language} href={`/${language}`} lang={language} hrefLang={language} aria-current={locale === language ? "page" : undefined} onClick={locale === language ? undefined : (event) => navigate(event, language)}>{language.toUpperCase()}</a>)}</nav>;
}
