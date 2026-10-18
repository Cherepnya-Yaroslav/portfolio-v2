---
name: "Yaroslav — Pixel AI Portfolio"
description: "A pixel product console for an AI developer, from idea to launch."
colors:
  primary-acid: "#d0f475"
  primary-hover: "#e7ffa8"
  ink-bg: "#151914"
  ivory-fg: "#f0f1df"
  sage-muted: "#a8b4a2"
  moss-line: "#3b4933"
  moss-panel: "#20271b"
  console-bg: "#0e100e"
  accent-ink: "#1b2412"
  contact-muted: "#42532d"
  contact-line: "#9fbd58"
typography:
  display:
    fontFamily: "Tiny5, monospace"
    fontSize: "clamp(48px, 5.6vw, 90px)"
    fontWeight: 700
    lineHeight: 0.97
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Tiny5, monospace"
    fontSize: "clamp(42px, 5.8vw, 84px)"
    fontWeight: 700
    lineHeight: 1.13
    letterSpacing: "-0.02em"
  project-title:
    fontFamily: "Tiny5, monospace"
    fontSize: "58px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "clamp(22px, 2.1vw, 30px)"
    fontWeight: 550
    lineHeight: 1.3
  body:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.9
  label:
    fontFamily: "Tiny5, monospace"
    fontSize: "24px"
    fontWeight: 500
  control:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "11px"
    fontWeight: 650
    letterSpacing: "0.015em"
rounded:
  square: "0px"
spacing:
  compact: "8px"
  related: "16px"
  row-gap: "20px"
  mobile-gutter: "22px"
  column: "32px"
  row: "35px"
  gutter: "clamp(24px, 4.2vw, 84px)"
  section: "clamp(90px, 10vw, 160px)"
  section-mobile: "78px"
components:
  button-primary:
    backgroundColor: "{colors.primary-acid}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.square}"
    padding: "17px 22px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-retry:
    backgroundColor: "transparent"
    textColor: "{colors.primary-acid}"
    rounded: "{rounded.square}"
    padding: "12px 18px"
  technology-tag:
    backgroundColor: "{colors.moss-panel}"
    textColor: "{colors.sage-muted}"
    rounded: "{rounded.square}"
    padding: "6px 11px"
  technology-column:
    backgroundColor: "transparent"
    textColor: "{colors.ivory-fg}"
    rounded: "{rounded.square}"
    padding: "35px 32px"
  project-row:
    backgroundColor: "transparent"
    textColor: "{colors.ivory-fg}"
    rounded: "{rounded.square}"
    padding: "35px 0"
  contact-row:
    backgroundColor: "{colors.primary-acid}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.square}"
    padding: "25px 0"
  pixel-console:
    backgroundColor: "{colors.console-bg}"
    textColor: "{colors.sage-muted}"
    rounded: "{rounded.square}"
  skip-link:
    backgroundColor: "{colors.primary-acid}"
    textColor: "{colors.ink-bg}"
    rounded: "{rounded.square}"
    padding: "15px 22px"
---

# Design System: Yaroslav — Pixel AI Portfolio

## Overview

**Creative North Star: "Pixel product console"**

A dark, green-black workspace pairs bitmap headings and an acid green signal with clear, quiet body text. The robot wordmark, executable-window frame and square controls give the portfolio a consistent pixel identity. The personal portrait stays photographic inside the console; project previews retain their own product colors.

The system supports Ярослав / Yaroslav as an AI developer who takes a product from idea to launch. Text stays direct about products, services and AI. This record describes the selected main `/ru` and `/en` experience; its authority is the implemented Pixel surface, not archived alternate studies or inherited global theme defaults.

**Key Characteristics:**
- Bitmap display lettering paired with readable Manrope body text.
- Acid green actions and console chrome on a green-black ground.
- Square geometry, thin structural rules and flat sections.
- A scroll-controlled portrait console and a full-width inverted contact footer.
- Equivalent Russian and English surfaces with the current section retained when switching language.

Evidence: `src/app/[locale]/portfolio.css`, `src/components/portfolio/*.tsx`, `src/content/pixel-portfolio.ts`, the active page and locale layout, and `.impeccable/review/main-{1440,659,390}.png` with their full-page captures. The current surface brief is `.impeccable/surfaces/src-app-locale-page-tsx.md`. This is an implementation record, not a deployment claim.

## Colors

Warm ivory and muted sage sit on a near-black green ground. Acid is a functional signal that expands into the contact surface.

### Primary
- **Acid Green** (`primary-acid`): hero emphasis, robot identity, primary action, console frame and title bar, project numbering, focus outlines and the contact background.
- **Light Acid** (`primary-hover`): primary action hover state.

### Neutral
- **Green Ink** (`ink-bg`): page ground and text on the skip link.
- **Warm Ivory** (`ivory-fg`): primary text and the first lines of the display heading.
- **Muted Sage** (`sage-muted`): descriptions, secondary labels, navigation and console footer text.
- **Moss Rule** (`moss-line`): thin navigation, technology, project and console dividers.
- **Moss Panel** (`moss-panel`): technology tag fill and image fallback ground.
- **Console Black** (`console-bg`): portrait console ground.
- **Acid Ink** (`accent-ink`): legible dark text on acid actions, badges and contact surface.
- **Contact Moss** (`contact-muted`): secondary text and hover state within the acid footer.
- **Contact Rule** (`contact-line`): dividers within the acid footer.

**The Signal and Inversion Rule.** Use acid for emphasis and action on dark sections; the contact section deliberately inverts the relationship into an acid ground with dark text. Scope its muted and divider colors to that surface.

Project preview artwork and the user-supplied video may carry their own colors. They are content, not additions to the UI palette. Sidecar tonal ramps are synthesized preview aids, not additional production color tokens.

## Typography

**Display Font:** Tiny5, with monospace fallback. The local font face is `/fonts/tiny5.ttf` and includes the Cyrillic used by the Russian surface.

**Body Font:** Manrope Variable, with sans-serif fallback, loaded by the locale layout.

**Character:** Tiny5 supplies the pixel silhouette in display headings, project names, technology group labels and console details. Manrope keeps descriptions, names, links and technology tags readable. The frontmatter records the actual CSS weights; the Tiny5 source face itself declares weight (400).

### Hierarchy
- **Display:** the hero uses the `display` token, three explicit lines, and an acid final line with an underscore caret. At widths up to (700px), it uses `clamp(35px, 8.6vw, 55px)`, line height (0.95) and tracking (-0.02em). Between (550px) and (700px), the heading is (42px); short mobile viewports use (7.7vw).
- **Headline:** section and contact headings use `headline`; the mobile override is (43px). A secondary heading line may be acid on dark sections or contact moss on the acid footer.
- **Project title:** `project-title` names each project, with an acid full stop. It becomes (43px) at widths up to (700px).
- **Title:** Manrope service titles use `title`. Identity names use (18px), weight (600), and become (14px) on narrow screens or (17px) in the intermediate mobile range.
- **Body:** `body` describes technologies and projects. The hero is (13px), line height (1.8), with a maximum width of (360px); mobile uses line height (1.75), with a short-viewport reduction to (12px).
- **Label:** `label` names Frontend, Backend and AI. Navigation is Manrope (13px), reducing to (12px) on mobile. Technology tags are (11px); console labels and metadata are subordinate to body copy.
- **Control:** `control` styles the primary action. Mobile uses (12px), reducing to (11px) on short viewports.

**The Two Voices Rule.** Use Tiny5 for identity and display hierarchy, and Manrope for reading and task controls. Retain both voices in both locales.

## Layout

The page uses a fluid horizontal gutter from `spacing.gutter`, replaced by `spacing.mobile-gutter` at widths up to (700px). Section spacing follows `spacing.section`, with mobile block padding from `spacing.section-mobile`. Rules align to the same gutter as the text.

The desktop hero is a two-column grid (1.07fr / 1fr), with a (5%) gap. Its sticky viewport is (100svh), with minimum height (760px), inside a (190svh) scroll scene. Above (1800px), the hero is centered with a maximum width of (1700px). At desktop heights up to (830px), its minimum height becomes (680px) and the console compacts. At widths up to (1050px), the columns become equal and the discipline annotation is hidden.

At widths up to (700px), the scene is (180svh). The header is (68px) tall; the heading spans both hero columns, then the identity, copy and action sit beside the portrait console. The grid gap is (22px 16px). The console is limited to (390px) in height. This is the observed mobile composition at (390px) and (659px), not a collapsed portrait-only stack. Viewports up to (730px) tall reduce gaps and hide the small AI-tool line.

Technology capabilities form three equal columns inside one ruled band: **Frontend**, **Backend**, **AI**. Interior columns have vertical dividers and horizontal padding from `spacing.column`; the outer edges align with the page. At widths up to (900px), these become stacked rows with horizontal dividers. Keep the three categories distinct; Codex, Higgsfield, RAG, MCP and Skills belong in AI. The section has an accessible hidden heading rather than a visible introductory block.

Projects form a list of ruled rows, not a tiled card grid. Desktop rows use (1fr / 1.2fr), with information at left and a square-corner preview at right. Previews have aspect ratio (1.65). At widths up to (700px), the preview comes first and spans the row, followed by the text; row padding becomes (25px). Titles, categories, descriptions, roles, technology tags and available links remain present.

The contact footer spans the full width. Each contact row has a label, address and arrow in a (1fr / 1.2fr / 24px) grid. Mobile puts the address on a second line, keeps the arrow at right and allows long addresses to wrap. Contact links remain Telegram, Email and GitHub from the content source.

## Elevation & Depth

The implemented interface is flat: there is no shadow vocabulary or glass blur. Depth comes from contrast, one-pixel section rules, the two-pixel acid console frame, and a small overlapping acid robot sticker. Photographic depth belongs to the portrait video; project artwork stays within its preview.

**The Framed Depth Rule.** Separate interface regions with color and rules. Preserve the console sticker's small overlap without adding a global drop-shadow system.

## Shapes

Controls, tags, project previews, badges and the console use the square token. Section dividers are (1px); the console frame is (2px). Keep the SVG robot crisp and rectilinear. The small circular video signal is an existing status detail and does not change the control shape language.

Icons are inline SVG. Standard arrows and technology icons remain simple line drawings; the robot is a filled pixel silhouette. The CTA's triangular play marker is a clipped shape and is hidden on mobile.

## Components

### Buttons

Primary actions are acid rectangles with dark text, (17px) gap and a minimum height of (52px); the frontmatter `height` describes that observed minimum rather than a fixed-height restriction. Hover changes to Light Acid through a (180ms) color transition. On mobile the action has a minimum height of (46px), with compact padding (12px 10px); the intermediate mobile range uses (14px 16px). Permit a two-line localized label.

The retry action is transparent with an acid (1px) border and acid text. Disabled retry uses opacity (0.55). It belongs to the project error state; do not show it in an ordinary empty state.

### Chips

Technology tags are non-interactive labels: square corners, Moss Panel fill, Moss Rule border, Muted Sage text and the `technology-tag` padding. They wrap with gaps (8px) in service lists and (6px) in projects. Mobile reduces horizontal padding to (9px). They do not acquire button behavior or invented selected states.

### Cards / Containers

Technology columns are transparent, separated by rules rather than enclosed rounded panels. Their heading row pairs a Tiny5 acid category name with a simple SVG technology icon; a Manrope title and description precede wrapped tags.

Project rows preserve actual project data and content imagery. A numbered acid badge sits at the preview's upper left. Show the concept label when `demo` is true, and only render project or repository links when provided. The currently observed demo previews are forma, pulse and spot; those names are content examples, not fixed design tokens. Loading uses an announced status; loading failure uses direct copy and retry; an empty result has a calm text message.

The public portfolio has no text input component. This document does not invent a field system or extend its scope into the admin application.

### Navigation

The header pairs the robot and Tiny5 `YA_` wordmark with three Manrope anchor links and an RU/EN language link. The header's bottom rule aligns with the page gutter. Navigation text changes from Muted Sage to Acid Green on hover through a (160ms) transition. Language switching retains the current hero, technology, project or contact section. Preserve real anchor destinations and accessible link names.

### Portrait Console

The console has a square acid frame, an acid Tiny5 title bar, dark portrait video and a ruled footer. Its desktop height is `min(66svh, 660px)` with minimum (460px). The video uses `object-fit: cover` and a portrait crop centered at (33%) vertically on desktop; mobile centers the crop.

Scroll progress maps to the supplied `/video/laptop-scroll.mp4`: scrolling down opens the laptop, scrolling up closes it. A thin progress line follows the same position. Keep the `/video/laptop-poster.webp` fallback, loading status, failure status and localized scroll explanation. Under reduced motion, the video seeks to a stable frame at (3.75s) and the copy explains the preference. The console title and footer are native window/status details, not a model for adding decorative page kickers.

### Contact Footer

The full-width acid footer is the strongest color field on the page. Its Tiny5 invitation, dark arrow motif and ruled contact rows make the next action clear. Addresses use the contact muted color; rows hover toward that color through a (150ms) transition. Preserve the contact values from the existing content source. The bottom line carries the name, current content year, short AI/product statement and a back-to-top anchor.

### Focus and Skip Link

Links and buttons use an acid (2px) `:focus-visible` outline with offset (6px). The focused skip link is an acid rectangle with Green Ink text and square corners; it appears at the top left and targets `#main`. The contact section inherits the acid outline as implemented. Do not substitute legacy lavender or a rounded skip-link treatment. Reduced-motion preferences remove animation and make transition duration (0.01ms).

## Do's and Don'ts

### Do:
- **Do** use the Pixel palette and square control geometry on the main Russian and English routes.
- **Do** pair Tiny5 identity and display text with Manrope reading text.
- **Do** keep Frontend, Backend and AI as distinct capability groups, with the requested AI tools in AI.
- **Do** use ruled project rows, preserve real preview artwork, and label demonstration concepts honestly.
- **Do** keep the laptop interaction reversible and honor reduced-motion, loading and failure states.
- **Do** preserve visible keyboard focus, the themed skip link and reachable localized contact links.
- **Do** maintain the acid contact inversion with its own dark text and divider colors.

### Don't:
- **Don't** use archived alternate studies or legacy global theme colors as authority for new public surfaces.
- **Don't** turn the square controls, tags or preview frames into rounded pills or glass panels.
- **Don't** add a shadow system to flat sections or replace their structural rules with decorative effects.
- **Don't** treat project artwork colors, generated tonal ramps or occasional status details as new UI primitives.
- **Don't** add decorative page kickers by copying native console status labels.
- **Don't** add unverified clients, experience metrics, availability or deployment claims to the visual story.
