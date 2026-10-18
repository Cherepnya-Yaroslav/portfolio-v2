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

STORY: The whole screen waits for the real scroll video to buffer. Progress reflects buffered duration, with no artificial demo delay. Fade into the real site at completion. A video error or fifteen seconds without buffering progress releases the site so projects and contacts remain reachable. Disable motion under reduced-motion preferences; no-JavaScript visitors can read the portfolio.

FIRST VIEWPORT: Robot/YA_ signature above a centered YAROSLAV.EXE window. Two-line heading, right-aligned percentage and segmented rail. The native window footer remains. No prototype controls or extra explanatory copy.

FORM: A local extension of the user-selected Boot composition. 280ms opacity reveal; complete buffer and decoded frame trigger it. Inert background and root scroll lock while active; both released after reveal. Preserve page hashes and the reversible laptop scroll interaction. RU and EN supported. Prototypes archived at branch codex/loading-screen-prototypes.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
