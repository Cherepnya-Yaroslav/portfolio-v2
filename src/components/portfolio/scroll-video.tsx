"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowIcon } from "@/components/icons";
import type { Locale } from "@/content/portfolio";
import { portfolioVideo } from "@/content/portfolio-video";
import { usePortfolioVideoLoading } from "./portfolio-loading";

type ScrollVideoProps = {
  sceneRef: RefObject<HTMLElement | null>;
  locale: Locale;
};

export function ScrollVideo({ sceneRef, locale }: ScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const registerVideo = usePortfolioVideoLoading();

  useEffect(() => {
    const video = videoRef.current;
    const scene = sceneRef.current;
    if (!video || !scene) return;
    const stopPreloading = registerVideo?.(video);

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let targetTime = 0;
    let disposed = false;

    function seek() {
      if (!video || !Number.isFinite(video.duration) || video.seeking) return;
      if (Math.abs(video.currentTime - targetTime) > 0.025)
        video.currentTime = targetTime;
    }

    function update() {
      frame = 0;
      if (!video || !scene || disposed) return;
      const rect = scene.getBoundingClientRect();
      const travel = Math.max(1, scene.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      progressRef.current?.style.setProperty(
        "--video-progress",
        `${progress * 100}%`,
      );
      targetTime = preference.matches
        ? 3.75
        : 0.35 + progress * Math.min(4.4, Math.max(0, video.duration - 0.45));
      seek();
    }

    function requestUpdate() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    function failed() {
      setFailed(true);
    }

    function loaded() {
      setReady(true);
      update();
    }

    function preferenceChanged() {
      setReducedMotion(preference.matches);
      requestUpdate();
    }

    preferenceChanged();
    video.addEventListener("loadeddata", loaded);
    video.addEventListener("error", failed);
    video.addEventListener("seeked", seek);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    preference.addEventListener("change", preferenceChanged);
    if (video.error || video.networkState === video.NETWORK_NO_SOURCE) failed();
    if (video.readyState >= 2) loaded();

    return () => {
      disposed = true;
      stopPreloading?.();
      cancelAnimationFrame(frame);
      video.removeEventListener("loadeddata", loaded);
      video.removeEventListener("error", failed);
      video.removeEventListener("seeked", seek);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      preference.removeEventListener("change", preferenceChanged);
    };
  }, [sceneRef, registerVideo]);

  return (
    <div className={`pf-video-shell${failed ? " pf-video-failed" : ""}`}>
      <video
        ref={videoRef}
        className="pf-video"
        poster={portfolioVideo.poster}
        muted
        playsInline
        preload="auto"
        aria-label={
          locale === "ru"
            ? "Ярослав открывает ноутбук при прокрутке вниз и закрывает при прокрутке вверх"
            : "Yaroslav opens the laptop as you scroll down and closes it as you scroll up"
        }
      >
        <source src={portfolioVideo.mobile} media="(max-width: 700px)" type="video/mp4" />
        <source src={portfolioVideo.desktop} type="video/mp4" onError={() => setFailed(true)} />
      </video>
      <div className="pf-video-progress" ref={progressRef} aria-hidden="true">
        <span />
      </div>
      {failed && (
        <p className="pf-video-status" role="status">
          {locale === "ru"
            ? "Видео недоступно. Обновите страницу, чтобы попробовать снова."
            : "Video unavailable. Refresh the page to try again."}
        </p>
      )}
      {!ready && !failed && (
        <span className="pf-video-loading" role="status">
          {locale === "ru" ? "Загружаем видео…" : "Loading video…"}
        </span>
      )}
      <p className="pf-scroll-note">
        <ArrowIcon direction="down" />
        <span>
          {reducedMotion
            ? locale === "ru"
              ? "Анимация уменьшена по вашим настройкам"
              : "Motion reduced to match your preferences"
            : locale === "ru"
              ? "Листайте — я открою ноутбук"
              : "Scroll. I’ll open the laptop."}
        </span>
      </p>
    </div>
  );
}
