---
version: 1
slug: "src-components-portfolio-portfolio-loading-tsx"
primary_target: "src/components/portfolio/portfolio-loading.tsx"
related_targets: ["src/components/portfolio/portfolio-loading.css","src/components/portfolio/scroll-video.tsx"]
---

# Portfolio video loading gate

Mode: Operate, a full-screen waiting state inside the existing Experience portfolio.

## Direction contract

THESIS: Apply the user-selected boot-window prototype to the real portfolio, with only “Открываю портфолио” / “Opening portfolio” and the existing loading indicator. Remove the explanations about loading video and being able to scroll.

OWN-WORLD: Retain the selected pixel world: green-black, ivory, acid green, Tiny5, square executable window, existing robot signature. No new fonts or raster assets.

STORY: The whole screen waits only for a decoded scroll-video frame, then the remaining video loads in the background. Progress reflects initial buffering, with no artificial demo delay. A video error or an absolute four-second wait releases the site so projects and contacts remain reachable. The deadline never resets on progress. Disable motion under reduced-motion preferences; no-JavaScript visitors can read the portfolio.

FIRST VIEWPORT: Robot/YA_ signature above a centered YAROSLAV.EXE window. Two-line heading, right-aligned percentage and segmented rail. The native window footer remains. No prototype controls or extra explanatory copy.

FORM: A local extension of the user-selected Boot composition. 280ms opacity reveal after a decoded frame or the deadline/error fallback, with the overlay removed at 300ms. Inert background and root scroll lock while active; both released after reveal. Preserve page hashes and the reversible laptop scroll interaction. RU and EN supported. Prototypes archived at branch codex/loading-screen-prototypes.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Video startup optimization — 2026-10-20

Reproduced the blocking path with a decoded frame and a slowly progressing partial buffer: the previous gate stayed closed beyond six seconds. It required the complete file and reset a fifteen-second timer on every progress event. Six regression tests cover partial decoding, the fixed deadline, metadata-only loading, errors, cleanup and sources that failed before hydration; they join the existing transport/deployment CI checks.

Retain the original 5.1667s/24fps animation. H.264 MP4 at 900×1200 is 1,313,293 bytes (previously 3,381,196); the mobile 540×720 version is 498,098 bytes. Both use six-frame keyframe spacing, no B-frames and fast-start metadata. SSIM against the original, scaled to each output size: 0.9944 desktop / 0.9916 mobile. Source URLs include twelve-character SHA-256 versions; immutable caching applies only to versioned media URLs. Unversioned aliases retain revalidation and byte-range support.

Production-build browser checks use a local HTTP proxy that limits video to 8 KiB/s and disables caching. The site was usable with about one second buffered out of 5.17 seconds. Normal-speed desktop scrubbing moved 0.35 → 3.2833 → 0.35 seconds when scrolling down/up. Mobile selected its smaller source; desktop selected the original-resolution source. A final-source network failure retains the poster and existing video-error text. No visual system changes.

Final verification: 15 transport/deployment/video tests, lint, build and typecheck pass. The original reproduction now releases on a decoded partial buffer. Versioned video/poster requests return HTTP 206 with immutable caching; both MP4s keep metadata before media data. Browser failure testing confirms that failed sources, including failure before hydration, release the page and show the existing error message. The scoped detector reports no findings. Desktop, scrubbed desktop and slow-mobile captures are under `.impeccable/review/reviews/video-optimization/`. This is a performance correction, with the selected Boot composition and DESIGN.md preserved.
