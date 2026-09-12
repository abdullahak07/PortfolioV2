# Abdullah Ahmad Khan — Portfolio Design System

## Direction
Premium research editorial with restrained studio-grade motion. The site should feel authored by an experienced editorial/web designer, not assembled from UI trends or a component marketplace.

## Principles
- Content hierarchy before decoration.
- Warm paper as the primary surface, with one deliberate dark editorial stage for contrast and pacing.
- One wine accent used sparingly for emphasis and interaction.
- No neon AI styling, particles, glassmorphism, scroll hijacking, custom cursors, fake scientific visualisations, or continuous decorative animation.
- Motion must communicate hierarchy, entry, hover state, or reading progress.
- Prefer compositor-friendly transform/opacity/clip-path; never animate layout dimensions for decoration.
- Publications read like an academic index; projects read like case studies; teaching stays secondary.

## Typography
- Display: Newsreader, serif fallback.
- Interface/body: DM Sans, system sans fallback.
- Body minimum: 16px on mobile.
- Desktop reading measure: roughly 60–75 characters.
- Display type can be large but should remain editorial rather than billboard-like.

## Colour
- Paper: #F4F0E7
- Secondary paper: #ECE6DB
- Ink: #181714
- Ink soft: #2B2925
- Muted: #716B63
- Rule: #D5CFC4
- Accent: #7D2332
- Accent on dark: #C98490

## Layout
- Max content width: 1420px.
- Desktop uses asymmetrical editorial grids rather than repeated card grids.
- Mobile-first reflow; no horizontal scrolling or nested scroll regions.
- Section rhythm: approximately 94–154px desktop, ~82px mobile.
- Square corners by default; no gratuitous card radius.
- Contrast section order is intentional: paper hero → dark research → paper publications → dark projects → paper teaching → soft-paper about.

## Motion
- Native vertical scrolling only.
- Hero text uses a one-time masked entrance; portrait uses a one-time clip reveal.
- Section reveals are one-time IntersectionObserver transitions using opacity + <=18px translateY.
- Hover displacement stays small and purposeful.
- Header reading-progress line is requestAnimationFrame-throttled.
- No continuous canvas/WebGL loops, no GSAP/Lenis runtime, no pinned sections.
- Respect prefers-reduced-motion and render all final states immediately.

## Interaction
- Visible keyboard focus.
- Primary interactive targets at least 44px high on touch layouts where practical.
- Native details/summary for secondary teaching material.
- Active desktop navigation reflects the currently viewed section.

## Homepage hierarchy
1. Authored hero / identity / research proposition
2. Research thesis and four principles on a dark editorial stage
3. Three thesis/publication anchors + compact additional research index
4. Three selected project case studies on a dark studio stage
5. Teaching roles + optional interactive studio disclosure
6. About / contact / CV / Scholar / GitHub
