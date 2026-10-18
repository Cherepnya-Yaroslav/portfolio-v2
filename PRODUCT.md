# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

Personal portfolio of AI developer Ярослав Черепня / Yaroslav Cherepnya. Presents frontend, backend and AI capabilities, projects, and direct contact links in Russian and English.

## Capabilities and Constraints

Existing Next.js App Router, React, TypeScript, Tailwind CSS, and Manrope font. Published project data comes from the existing Supabase integration, with its existing demo and error states. Preserve the existing website, admin, project integration, contact details, and local uncommitted changes.

The user selected the pixel robot prototype as the main website. The main RU/EN routes now use this identity, without a prototype selector. Original and Glass studies are no longer active work. The supplied video remains scroll-controlled: down opens the laptop, up closes it.

The user selected the full-screen Boot loading window for the main RU/EN routes. It says «Открываю портфолио» / “Opening portfolio”, without the video-loading and scrolling explanations. Its percentage and segmented indicator reflect actual video buffering; a fully buffered video with a decoded frame reveals the portfolio. A video error or fifteen seconds without buffering progress also releases the site. There is no artificial demonstration delay. Respect reduced motion and keep the content available without JavaScript. The loading studies are archived on `codex/loading-screen-prototypes`.

Position Yaroslav as an AI developer who independently takes a product from idea to launch. Hero: «От идеи до готового продукта». Description: building web products, services and AI integrations. Avoid claims about writing code or “human persistence”. Remove the “One developer / the whole picture” introduction. Present Frontend, Backend and AI as three distinct technology groups. The AI group includes the user-requested Codex, Higgsfield, RAG, MCP and Skills. Preserve projects, contacts and the selected pixel footer.

## Brand Commitments

Keep Ярослав / Yaroslav as the portfolio identity. The user explicitly allows rewriting the copy. Preserve the factual claims, projects, and contact details. No additional clients, metrics, experience, or availability claims are established.

## Evidence on Hand

- Existing portfolio content: `src/content/portfolio.ts`.
- Existing visual implementation: `src/app/globals.css`, `src/app/[locale]/page.tsx`.
- Existing portrait: `public/images/yaroslav.webp`.
- Supplied video: `/Users/yaroslav/Downloads/hf_20261018_194334_06a6951e-206b-4d6c-985d-76fcf754613d.mp4` (5.17 seconds, 1440×1920).

## Open Decisions

The pixel visual direction and copy rewrites are confirmed by the user. The primary visitor audience is not explicitly confirmed.
