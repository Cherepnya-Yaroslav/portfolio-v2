"use client";

import { LoadingImage } from "./loading-image";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Dictionary, Locale, Project } from "@/content/portfolio";
import { ArrowIcon } from "./icons";

export function ProjectCarousel({ projects, locale, text }: { projects: Project[]; locale: Locale; text: Dictionary["work"] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  const goTo = useCallback((index: number, instant = false) => {
    const track = trackRef.current;
    if (!track) return;
    const targetIndex = Math.max(0, Math.min(index, projects.length - 1));
    const card = track.children[targetIndex] as HTMLElement | undefined;
    if (!card) return;
    const left = card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    track.scrollTo({ left, behavior: instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [projects.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const left = track.getBoundingClientRect().left;
        const cards = Array.from(track.children);
        const closest = cards.reduce((best, card, index) => Math.abs(card.getBoundingClientRect().left - left) < Math.abs(cards[best].getBoundingClientRect().left - left) ? index : best, 0);
        activeRef.current = closest;
        setActive(closest);
      });
    };
    const observer = new ResizeObserver(() => goTo(activeRef.current, true));
    observer.observe(track);
    track.addEventListener("scroll", update, { passive: true });
    return () => { observer.disconnect(); track.removeEventListener("scroll", update); cancelAnimationFrame(frame); };
  }, [goTo]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const destinations: Record<string, number> = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: projects.length - 1 };
    if (event.key in destinations) { event.preventDefault(); goTo(destinations[event.key]); }
  }

  if (projects.length === 0) return null;

  return <div className="carousel" role="region" aria-roledescription={locale === "ru" ? "карусель" : "carousel"} aria-label={text.carousel}>
    <div className="project-track" ref={trackRef} tabIndex={0} onKeyDown={onKeyDown} aria-label={text.hint}>
      {projects.map((project, index) => {
        const details = project.text[locale];
        const hasLinks = Boolean(project.website || project.repository);
        return <article key={project.id} className={`project-card project-${project.theme}`} aria-label={`${text.slide} ${index + 1} ${text.of} ${projects.length}: ${project.name}`}>
          <div className="project-visual">
            <div className="project-visual-top"><span className="concept-badge"><span className="tiny-dot" />{project.status === "wip" ? (locale === "ru" ? "В разработке" : "In progress") : details.category}</span><span className="project-index">{String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span></div>
            <LoadingImage key={project.preview} src={project.preview} loadingLabel={locale === "ru" ? "Загружаем обложку" : "Loading preview"} errorLabel={locale === "ru" ? "Обложка недоступна" : "Preview unavailable"} alt={details.alt} width={1100} height={640} className="project-preview" sizes="(max-width: 700px) 88vw, 75vw" />
            <span className="concept-caption">{text.concept}</span>
          </div>
          <div className="project-details">
            <div className="project-title-row"><div><p className="project-category">{details.category}</p><h3>{project.name}<span>.</span></h3></div><span className="project-corner-arrow"><ArrowIcon /></span></div>
            <p className="project-description">{details.description}</p>
            <div className="project-tags">{project.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>
            <div className="project-bottom"><div><span className="role-label">{text.role}</span><p>{details.role}</p></div>{hasLinks && <div className="project-links">
              {project.website && <a href={project.website} target="_blank" rel="noopener noreferrer">{text.website}<ArrowIcon /></a>}
              {project.repository && <a href={project.repository} target="_blank" rel="noopener noreferrer">{text.repository}<ArrowIcon /></a>}
            </div>}</div>
          </div>
        </article>;
      })}
    </div>
    <div className="carousel-controls"><p className="carousel-hint"><span>↔</span>{text.hint}</p><div className="carousel-navigation"><span className="slide-counter" aria-live="polite" aria-atomic="true"><span className="sr-only">{text.slide} </span>{String(active + 1).padStart(2, "0")}<span className="counter-total"> / {String(projects.length).padStart(2, "0")}</span></span><button className="circle-button" type="button" disabled={active === 0} onClick={() => goTo(active - 1)} aria-label={text.previous}><ArrowIcon direction="left" /></button><button className="circle-button" type="button" disabled={active === projects.length - 1} onClick={() => goTo(active + 1)} aria-label={text.next}><ArrowIcon direction="right" /></button></div></div>
  </div>;
}
