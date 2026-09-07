"use client";

import { useEffect, useRef } from "react";

export function Motion() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;
    const enabled = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    let frame = 0;

    function hide() {
      cancelAnimationFrame(frame);
      glow!.style.opacity = "0";
    }

    function move(event: PointerEvent) {
      if (!enabled.matches || event.pointerType === "touch") {
        hide();
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        glow!.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
        glow!.style.opacity = "1";
      });
    }

    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    document.addEventListener("pointercancel", hide);
    window.addEventListener("blur", hide);
    enabled.addEventListener("change", hide);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", hide);
      document.removeEventListener("pointercancel", hide);
      window.removeEventListener("blur", hide);
      enabled.removeEventListener("change", hide);
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("reveal-pending");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    if (!reduced.matches) elements.forEach((element) => {
      if (element.getBoundingClientRect().top >= window.innerHeight) {
        element.classList.add("reveal-pending");
        observer.observe(element);
      }
    });
    const hero = document.querySelector<HTMLElement>(".hero");
    const portrait = document.querySelector<HTMLElement>(".portrait-parallax");
    let frame = 0;
    function reset() {
      if (portrait) portrait.style.transform = "";
      if (reduced.matches) elements.forEach((element) => element.classList.remove("reveal-pending"));
    }
    function move(event: PointerEvent) {
      if (reduced.matches || !pointer.matches || !hero || !portrait) return;
      cancelAnimationFrame(frame);
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
      frame = requestAnimationFrame(() => { portrait.style.transform = `translate3d(${x}px, ${y}px, 0)`; });
    }
    hero?.addEventListener("pointermove", move);
    hero?.addEventListener("pointerleave", reset);
    reduced.addEventListener("change", reset);
    pointer.addEventListener("change", reset);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      elements.forEach((element) => element.classList.remove("reveal-pending"));
      hero?.removeEventListener("pointermove", move);
      hero?.removeEventListener("pointerleave", reset);
      reduced.removeEventListener("change", reset);
      pointer.removeEventListener("change", reset);
    };
  }, []);
  return <div className="cursor-glow" aria-hidden="true"><div className="cursor-glow-light" ref={glowRef} /></div>;
}
