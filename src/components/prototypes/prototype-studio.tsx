"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { ArrowIcon, Asterisk } from "@/components/icons";
import { copy, profile, type Locale } from "@/content/portfolio";
import { ScrollVideo } from "./scroll-video";
import { CodeIcon, ServerIcon } from "./prototype-icons";

export const prototypeVariants = ["original", "pixel", "glass"] as const;
export type PrototypeVariant = (typeof prototypeVariants)[number];

const variantNames: Record<PrototypeVariant, Record<Locale, string>> = {
  original: { ru: "Оригинал", en: "Original" },
  pixel: { ru: "Пиксель", en: "Pixel" },
  glass: { ru: "Liquid Glass", en: "Liquid Glass" },
};

function PixelRobot({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pv-robot ${className}`}
      viewBox="0 0 48 48"
      fill="currentColor"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <path d="M22 2h4v8h10v4h6v20h-6v8h-8v-6h-8v6h-8v-8H6V14h6v-4h10V2ZM12 16v14h24V16H12Zm4 4h4v6h-4v-6Zm12 0h4v6h-4v-6ZM2 20h4v10H2V20Zm40 0h4v10h-4V20Z" />
    </svg>
  );
}

function Header({
  locale,
  variant,
}: {
  locale: Locale;
  variant: PrototypeVariant;
}) {
  const text = copy[locale];
  return (
    <header className="pv-header">
      <a
        className="pv-wordmark"
        href={`/${locale}`}
        aria-label={
          locale === "ru"
            ? "Ярослав — основной сайт"
            : "Yaroslav — main website"
        }
      >
        {variant === "pixel" ? (
          <>
            <PixelRobot />
            <span>
              YA<span className="pv-accent">_</span>
            </span>
          </>
        ) : (
          <>
            ya<span className="pv-accent">.</span>
          </>
        )}
      </a>
      <nav
        className="pv-nav"
        aria-label={locale === "ru" ? "Основная навигация" : "Main navigation"}
      >
        {Object.entries(text.nav).map(([id, label]) => (
          <a key={id} href={`#${id}`}>
            {label}
          </a>
        ))}
      </nav>
      <div className="pv-header-end">
        <span className="pv-header-discipline">
          {variant === "pixel"
            ? "PLAYER / DEVELOPER"
            : "DESIGN MINDED. CODE DRIVEN."}
        </span>
        <a
          className="pv-language"
          href={`/${locale === "ru" ? "en" : "ru"}/prototypes?variant=${variant}`}
          hrefLang={locale === "ru" ? "en" : "ru"}
          aria-label={
            locale === "ru" ? "Switch to English" : "Переключить на русский"
          }
        >
          {locale === "ru" ? "EN" : "RU"}
          <ArrowIcon />
        </a>
      </div>
    </header>
  );
}

type HeroProps = { locale: Locale; sceneRef: RefObject<HTMLElement | null> };

function OriginalHero({ locale, sceneRef }: HeroProps) {
  const ru = locale === "ru";
  return (
    <div className="pv-original-hero">
      <h1 className="pv-original-name">{profile.name[locale]}</h1>
      <div className="pv-original-film">
        <ScrollVideo sceneRef={sceneRef} locale={locale} variant="original" />
      </div>
      <div className="pv-original-intro">
        <h2>
          {ru ? (
            <>
              От первой идеи
              <br />
              до{" "}
              <em>
                последней
                <br />
                строчки кода.
              </em>
            </>
          ) : (
            <>
              From the first idea
              <br />
              to the{" "}
              <em>
                last
                <br />
                line of code.
              </em>
            </>
          )}
        </h2>
        <p className="pv-role">Fullstack {ru ? "разработчик" : "developer"}</p>
        <p className="pv-hero-description">
          {ru
            ? "Интерфейсы, которые хочется трогать. Системы, на которые можно положиться."
            : "Interfaces you want to touch. Systems you can rely on."}
        </p>
        <a className="pv-button" href="#projects">
          {copy[locale].hero.cta}
          <span>
            <ArrowIcon />
          </span>
        </a>
      </div>
      <div className="pv-original-aside">
        <Asterisk />
        <p>
          FRONTEND.
          <br />
          BACKEND.
          <br />
          {ru ? "И ВСЁ МЕЖДУ НИМИ." : "AND EVERYTHING BETWEEN."}
        </p>
        <span>React / Python / Next.js</span>
      </div>
      <div className="pv-scene-foot">
        <span>{copy[locale].portfolio}</span>
        <span>
          {ru ? "Движение начинается с вас" : "You set things in motion"}
          <ArrowIcon direction="down" />
        </span>
      </div>
    </div>
  );
}

function PixelHero({ locale, sceneRef }: HeroProps) {
  const ru = locale === "ru";
  return (
    <div className="pv-pixel-hero">
      <div className="pv-pixel-copy">
        <h1>
          {ru ? (
            <>
              ЧЕЛОВЕК.
              <br />
              КОТОРЫЙ
              <br />
              <span>
                ПИШЕТ КОД<span className="pv-pixel-caret">_</span>
              </span>
            </>
          ) : (
            <>
              HUMAN.
              <br />
              WHO
              <br />
              <span>
                WRITES CODE<span className="pv-pixel-caret">_</span>
              </span>
            </>
          )}
        </h1>
        <div className="pv-pixel-details">
          <div className="pv-pixel-identity">
            <PixelRobot />
            <div>
              <strong>{profile.name[locale]}</strong>
              <p>Fullstack {ru ? "разработчик" : "developer"}</p>
            </div>
          </div>
          <p className="pv-hero-description">
            {ru
              ? "Собираю веб-продукты по пикселю: от первого экрана до сервера. React, Python и немного человеческого упорства."
              : "Building web products one pixel at a time. From the first screen to the server. React, Python, and a little human persistence."}
          </p>
          <a className="pv-button" href="#projects">
            <span className="pv-play-icon" aria-hidden="true" />
            {ru ? "СМОТРЕТЬ ПРОЕКТЫ" : "EXPLORE PROJECTS"}
            <ArrowIcon />
          </a>
          <div className="pv-pixel-stack">
            <span>REACT</span>
            <span>TYPESCRIPT</span>
            <span>PYTHON</span>
            <span>NEXT.JS</span>
          </div>
        </div>
      </div>
      <div className="pv-pixel-console">
        <div className="pv-console-bar">
          <span>
            <i />
            YAROSLAV.EXE
          </span>
          <span aria-hidden="true">− &nbsp; □ &nbsp; ×</span>
        </div>
        <ScrollVideo sceneRef={sceneRef} locale={locale} variant="pixel" />
        <div className="pv-console-foot">
          <span>HUMAN INSIDE</span>
          <span>FULLSTACK / 2026</span>
        </div>
        <div className="pv-pixel-sticker" aria-hidden="true">
          <PixelRobot />
          <span>
            100%
            <br />
            HUMAN
          </span>
        </div>
      </div>
      <div className="pv-scene-foot">
        <span>
          {ru ? "СДЕЛАНО РУКАМИ. И ГОЛОВОЙ." : "MADE WITH HANDS. AND A HEAD."}
        </span>
        <span>
          SCROLL TO OPEN
          <ArrowIcon direction="down" />
        </span>
      </div>
    </div>
  );
}

function GlassHero({ locale, sceneRef }: HeroProps) {
  const ru = locale === "ru";
  return (
    <div className="pv-glass-hero">
      <div className="pv-glass-heading">
        <h1>
          {ru ? (
            <>
              Сложное внутри.
              <br />
              <span>Простое снаружи.</span>
            </>
          ) : (
            <>
              Complex inside.
              <br />
              <span>Effortless outside.</span>
            </>
          )}
        </h1>
        <p>
          {ru
            ? "Ярослав. Fullstack-разработчик с вниманием к деталям."
            : "Yaroslav. A fullstack developer with an eye for detail."}
        </p>
        <div className="pv-glass-actions">
          <a className="pv-button" href="#projects">
            {copy[locale].hero.cta}
            <ArrowIcon />
          </a>
          <a className="pv-text-link" href="#contact">
            {ru ? "Давайте знакомиться" : "Let’s connect"}
            <ArrowIcon />
          </a>
        </div>
      </div>
      <div className="pv-glass-stage">
        <div className="pv-glass-film">
          <ScrollVideo sceneRef={sceneRef} locale={locale} variant="glass" />
        </div>
        <div className="pv-glass-plaque pv-plaque-front">
          <span className="pv-plaque-icon" aria-hidden="true">
            <CodeIcon />
          </span>
          <div>
            <strong>Frontend</strong>
            <span>React · TypeScript · Next.js</span>
          </div>
        </div>
        <div className="pv-glass-plaque pv-plaque-back">
          <span className="pv-plaque-icon" aria-hidden="true">
            <ServerIcon />
          </span>
          <div>
            <strong>Backend</strong>
            <span>Python · FastAPI · PostgreSQL</span>
          </div>
        </div>
        <div className="pv-glass-name">
          <span className="pv-avatar-dot" />
          {profile.name[locale]}
          <span>Fullstack developer</span>
        </div>
      </div>
    </div>
  );
}

export function PrototypeStudio({
  locale,
  initialVariant,
  children,
}: {
  locale: Locale;
  initialVariant: PrototypeVariant;
  children: ReactNode;
}) {
  const [variant, setVariant] = useState(initialVariant);
  const sceneRef = useRef<HTMLElement>(null);
  const ru = locale === "ru";

  const selectVariant = useCallback((next: PrototypeVariant) => {
    setVariant(next);
    const url = new URL(window.location.href);
    url.searchParams.set("variant", next);
    window.history.replaceState(null, "", url);
  }, []);

  const cycle = useCallback(
    (direction: number) => {
      const index = prototypeVariants.indexOf(variant);
      selectVariant(
        prototypeVariants[
          (index + direction + prototypeVariants.length) %
            prototypeVariants.length
        ],
      );
    },
    [selectVariant, variant],
  );

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return;
      if (
        event.target instanceof Element &&
        event.target.closest(
          "input, textarea, select, [contenteditable=true], video, [role=slider]",
        )
      )
        return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        cycle(event.key === "ArrowRight" ? 1 : -1);
      }
    }
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [cycle]);

  function choose(
    event: MouseEvent<HTMLAnchorElement>,
    next: PrototypeVariant,
  ) {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
      return;
    event.preventDefault();
    selectVariant(next);
  }

  return (
    <div className="prototype-studio" data-variant={variant}>
      <a className="skip-link" href="#main">
        {copy[locale].skip}
      </a>
      <main id="main">
        <section
          className="pv-scroll-scene"
          id="hero"
          ref={sceneRef}
          aria-label={ru ? "Знакомство с Ярославом" : "Meet Yaroslav"}
        >
          <div className="pv-scene-sticky">
            <Header locale={locale} variant={variant} />
            {variant === "original" ? (
              <OriginalHero locale={locale} sceneRef={sceneRef} />
            ) : variant === "pixel" ? (
              <PixelHero locale={locale} sceneRef={sceneRef} />
            ) : (
              <GlassHero locale={locale} sceneRef={sceneRef} />
            )}
          </div>
        </section>
        {children}
      </main>
      <nav
        className="pv-switcher"
        aria-label={ru ? "Выбрать прототип" : "Choose a prototype"}
      >
        <span className="pv-switcher-label">
          {ru ? "ТРИ ВЗГЛЯДА" : "THREE TAKES"}
        </span>
        <button
          className="pv-switch-arrow"
          type="button"
          onClick={() => cycle(-1)}
          aria-label={ru ? "Предыдущий прототип" : "Previous prototype"}
        >
          <ArrowIcon direction="down" />
        </button>
        <div className="pv-switch-options">
          {prototypeVariants.map((item, index) => (
            <a
              href={`/${locale}/prototypes?variant=${item}`}
              key={item}
              aria-current={variant === item ? "page" : undefined}
              onClick={(event) => choose(event, item)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {variantNames[item][locale]}
            </a>
          ))}
        </div>
        <button
          className="pv-switch-arrow"
          type="button"
          onClick={() => cycle(1)}
          aria-label={ru ? "Следующий прототип" : "Next prototype"}
        >
          <ArrowIcon direction="down" />
        </button>
        <span className="pv-sr-only" role="status" aria-live="polite">
          {variantNames[variant][locale]}
        </span>
      </nav>
    </div>
  );
}
