# Client testimonials

Mode: Experience. Main `/ru` and `/en` portfolio, after projects and before contacts.

The user selected the expandable reviews prototype and requested publishing it without the description «Отзывы о работе над сайтами». Retain its «Слово / клиентам.» heading, independent disclosure rows, rating, date, service and original Russian quotes. Three screenshot-sourced reviews only; no fabricated claims, platform attribution or historical job price.

Inherit the Pixel system from DESIGN.md: Tiny5 names and heading, Manrope quotes, acid green, green-black, square controls and thin structural rules. Preserve the selected prototype's desktop/mobile layout and spacing. No new visual world or global system changes.

Native details/summary controls expose review text without JavaScript. The optional bottom collapse action returns keyboard focus to its summary. Initial state: all reviews closed. Each opens independently. UI labels and dates follow the page locale; factual quotes remain in Russian. No carousel, selector or prototype query is shipped. Original studies remain on `codex/testimonials-prototypes`.

## QUALITY BAR — selected prototype

Keep all real review content complete and readable, touch-sized summary controls, visible keyboard focus, independent opening/closing and no horizontal overflow at mobile, intermediate and desktop sizes. The heading has no descriptive subtitle. Neighboring projects, loading video and contact footer retain their behavior.

## Validation — 2026-10-20

The documenter checked `testimonials.tsx`, `testimonials.css`, the three review records, the main locale page integration and all six captures in `.impeccable/review/reviews/selected/`: `desktop.png`, `desktop-open.png`, `user-659.png`, `user-659-open.png`, `mobile.png` and `mobile-open.png`. Closed and expanded states preserve the inherited Pixel palette, Tiny5/Manrope roles, square disclosure controls, structural rules and responsive page gutters. Quote sizing, heading line height and section spacing belong to this selected surface; they do not establish new global tokens.

The visual review disposition is **ship**, scoped to promotion of the selected reviews feature into the existing RU/EN portfolio; no material fixes remained and the refinement ceiling was reached. The implementation verification reports passing lint, typecheck, production build and nine existing transport/deployment tests, plus HTTP 200 on both locale routes with three native disclosures and no removed subtitle or prototype controls. This documenter pass checked the source and captured appearance; it did not rerun those checks or certify a deployment.

`DESIGN.md`, `.impeccable/design.json` and `PRODUCT.md` are preserved. No new visual world or refresh of pre-existing system drift is part of this extension.
