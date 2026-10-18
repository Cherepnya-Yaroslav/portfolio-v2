"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/content/portfolio";
import { PixelRobot } from "./icons";
import "./portfolio-loading.css";

type RegisterVideo = (video: HTMLVideoElement) => () => void;
const VideoLoadingContext = createContext<RegisterVideo | null>(null);

export function usePortfolioVideoLoading() {
  return useContext(VideoLoadingContext);
}

export function PortfolioLoading({ locale, children }: { locale: Locale; children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState({ progress: 0, complete: false });
  const [revealed, setRevealed] = useState(false);
  const ru = locale === "ru";

  const finish = useCallback(() => {
    setLoad({ progress: 100, complete: true });
  }, []);

  const registerVideo = useCallback<RegisterVideo>((video) => {
    let lastBuffered = 0;
    // Release the site if the video stops making progress for fifteen seconds.
    let stallTimeout = window.setTimeout(finish, 15000);
    function finishLoading() {
      clearTimeout(stallTimeout);
      finish();
    }
    function update() {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      let buffered = 0;
      for (let index = 0; index < video.buffered.length; index++) {
        buffered += video.buffered.end(index) - video.buffered.start(index);
      }
      const complete = video.readyState >= 2 && video.buffered.length === 1
        && video.buffered.start(0) < 0.1 && video.buffered.end(0) >= video.duration - 0.1;
      if (complete) { finishLoading(); return; }
      if (buffered > lastBuffered) {
        lastBuffered = buffered;
        clearTimeout(stallTimeout);
        stallTimeout = window.setTimeout(finish, 15000);
      }
      const progress = Math.min(99, Math.floor(buffered / video.duration * 100));
      setLoad((current) => current.complete || progress <= current.progress ? current : { progress, complete: false });
    }

    const events = ["loadedmetadata", "loadeddata", "canplaythrough", "progress", "suspend"];
    events.forEach((event) => video.addEventListener(event, update));
    video.addEventListener("error", finishLoading);
    update();
    if (video.error) finishLoading();
    return () => {
      clearTimeout(stallTimeout);
      events.forEach((event) => video.removeEventListener(event, update));
      video.removeEventListener("error", finishLoading);
    };
  }, [finish]);

  useEffect(() => {
    if (!load.complete) return;
    const timeout = window.setTimeout(() => setRevealed(true), 300);
    return () => clearTimeout(timeout);
  }, [load.complete]);

  useEffect(() => {
    const content = contentRef.current;
    if (revealed || !content) return;
    const previousInert = content.inert;
    content.inert = true;
    return () => { content.inert = previousInert; };
  }, [revealed]);

  return <VideoLoadingContext.Provider value={registerVideo}>
    <div ref={contentRef}>{children}</div>
    {!revealed && <div className="pf-loader" data-state={load.complete ? "exiting" : "loading"}>
      <header className="pf-loader-header">
        <div className="pf-loader-signature"><PixelRobot /><span>YA_</span></div>
        <span>AI DEVELOPER</span>
      </header>
      <div className="pf-loader-center">
        <div className="pf-loader-window">
          <div className="pf-loader-bar"><span>YAROSLAV.EXE</span><div aria-hidden="true"><i /><i /></div></div>
          <div className="pf-loader-body">
            <h2>{ru ? "ОТКРЫВАЮ" : "OPENING"}<br /><span>{ru ? "ПОРТФОЛИО" : "PORTFOLIO"}<span className="pf-loader-caret" aria-hidden="true">_</span></span></h2>
            <div className="pf-loader-percent" aria-hidden="true">{load.progress}%</div>
            <div className="pf-loader-segments" role="progressbar" aria-label={ru ? "Открываю портфолио" : "Opening portfolio"} aria-valuenow={load.progress} aria-valuemin={0} aria-valuemax={100}>
              {Array.from({ length: 24 }, (_, index) => <span key={index} data-filled={index < Math.round(load.progress * 24 / 100)} />)}
            </div>
          </div>
          <div className="pf-loader-foot" aria-hidden="true"><span>{ru ? "ПЕРВЫЙ ЭКРАН" : "FIRST SCREEN"}</span><span>{load.complete ? "READY" : "LOADING"}<i /></span></div>
        </div>
      </div>
    </div>}
    <noscript><style>{".pf-loader{display:none!important}html:has(.pf-loader){overflow:auto!important}"}</style></noscript>
  </VideoLoadingContext.Provider>;
}
