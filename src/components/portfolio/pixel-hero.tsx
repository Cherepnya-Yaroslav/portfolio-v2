"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { ArrowIcon } from "@/components/icons";
import { profile, type Locale } from "@/content/portfolio";
import { pixelCopy } from "@/content/pixel-portfolio";
import { PixelRobot } from "./icons";
import { ScrollVideo } from "./scroll-video";

export function PixelHero({ locale }: { locale: Locale }) {
  const sceneRef = useRef<HTMLElement>(null);
  const text = pixelCopy[locale];
  const targetLocale = locale === "ru" ? "en" : "ru";

  useEffect(() => {
    const anchor = window.location.hash.slice(1);
    if (!["hero", "about", "projects", "contact"].includes(anchor)) return;
    const frame = requestAnimationFrame(() => {
      sceneRef.current
        ?.closest(".portfolio-site")
        ?.querySelector<HTMLElement>(`#${anchor}`)
        ?.scrollIntoView({ block: "start", behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [locale]);

  function changeLanguage(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    const content = sceneRef.current?.closest(".portfolio-site");
    const section = ["hero", "about", "projects", "contact"].reduce(
      (active, id) => {
        const element = content?.querySelector<HTMLElement>(`#${id}`);
        return element &&
          element.getBoundingClientRect().top <= innerHeight * 0.4
          ? id
          : active;
      },
      "hero",
    );
    event.currentTarget.href = `/${targetLocale}${section === "hero" ? "" : `#${section}`}`;
  }

  return (
    <section
      className="pf-scroll-scene"
      id="hero"
      ref={sceneRef}
      aria-labelledby="hero-title"
    >
      <div className="pf-scene-sticky">
        <header className="pf-header">
          <a
            className="pf-wordmark"
            href={`/${locale}`}
            aria-label={
              locale === "ru" ? "Ярослав — на главную" : "Yaroslav — home"
            }
          >
            <PixelRobot />
            <span>
              YA<span className="pf-accent">_</span>
            </span>
          </a>
          <nav
            className="pf-nav"
            aria-label={
              locale === "ru" ? "Основная навигация" : "Main navigation"
            }
          >
            {Object.entries(text.nav).map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </nav>
          <div className="pf-header-end">
            <span className="pf-header-discipline">
              AI / PRODUCTS / AUTOMATION
            </span>
            <a
              className="pf-language"
              href={`/${targetLocale}`}
              lang={targetLocale}
              hrefLang={targetLocale}
              onClick={changeLanguage}
              aria-label={
                locale === "ru" ? "Switch to English" : "Переключить на русский"
              }
            >
              {targetLocale.toUpperCase()}
              <ArrowIcon />
            </a>
          </div>
        </header>
        <div className="pf-pixel-hero">
          <div className="pf-pixel-copy">
            <h1 id="hero-title">
              {text.hero.lines[0]}
              <br />
              {text.hero.lines[1]}
              <br />
              <span>
                {text.hero.lines[2]}
                <span className="pf-pixel-caret">_</span>
              </span>
            </h1>
            <div className="pf-pixel-details">
              <div className="pf-pixel-identity">
                <PixelRobot />
                <div>
                  <strong>{profile.name[locale]}</strong>
                  <p>{text.hero.role}</p>
                </div>
              </div>
              <p className="pf-hero-description">{text.hero.description}</p>
              <a className="pf-button" href="#projects">
                <span className="pf-play-icon" aria-hidden="true" />
                {text.hero.cta}
                <ArrowIcon />
              </a>
              <div
                className="pf-pixel-stack"
                aria-label={locale === "ru" ? "AI-инструменты" : "AI tools"}
              >
                <span>CODEX</span>
                <span>RAG</span>
                <span>MCP</span>
                <span>SKILLS</span>
              </div>
            </div>
          </div>
          <div className="pf-pixel-console">
            <div className="pf-console-bar">
              <span>
                <i />
                YAROSLAV.EXE
              </span>
              <span className="pf-window-controls" aria-hidden="true">
                <i />
                <i />
              </span>
            </div>
            <ScrollVideo sceneRef={sceneRef} locale={locale} />
            <div className="pf-console-foot">
              <span>AI DEVELOPER</span>
              <span>PORTFOLIO / 2026</span>
            </div>
            <div className="pf-pixel-sticker" aria-hidden="true">
              <PixelRobot />
              <div>
                <span className="pf-sticker-flow">
                  0<ArrowIcon direction="right" />1
                </span>
                <span>PRODUCTS</span>
              </div>
            </div>
          </div>
          <div className="pf-scene-foot">
            <span>{text.hero.footnote}</span>
            <span>
              {text.hero.scroll}
              <ArrowIcon direction="down" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
