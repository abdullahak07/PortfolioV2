# Abdullah Ahmad Khan — Portfolio Design System

## Direction
Glance-first premium research portfolio. The homepage must sell the person before it asks the visitor to read the research story. A visitor should understand who Abdullah is, what he does, what proves it, and where to go next within 5–10 seconds.

## Principles
- Identity and proof before philosophy.
- The first viewport must contain name, role, PhD focus, concise value proposition, proof points, portrait and primary actions.
- Depth comes after the overview; deeper research, projects and teaching remain available below.
- Warm paper is the primary surface, with one deliberate dark project stage for contrast.
- One wine accent is used sparingly for status and interaction.
- No neon AI styling, particles, glassmorphism, scroll hijacking, custom cursors, fake scientific visualisations, or continuous decorative animation.
- Motion communicates hierarchy, entry, hover state or reading progress only.
- Prefer transform and opacity; avoid decorative layout animation.

## Typography
- Display: Newsreader, serif fallback.
- Interface/body: DM Sans, system sans fallback.
- Body minimum: 16px desktop baseline; 14–15px secondary copy where appropriate.
- Hero name max: ~70px desktop, ~58px mobile.
- Hero proposition max: ~39px desktop, ~33px mobile.
- Section headings max: ~57px desktop.
- Project/research titles should feel editorial, not billboard-sized.

## Colour
- Paper: #F5F1E8
- Secondary paper: #EEE8DC
- Surface: #FBF9F4
- Ink: #191815
- Ink soft: #302E29
- Muted: #706A61
- Rule: #D8D1C5
- Accent: #7C2635
- Accent dark: #5D1D29
- Accent on dark: #C99099
- Dark stage: #1B1A17

## Layout
- Max content width: 1280px.
- Desktop hero uses a 2-column identity/profile composition.
- Opening viewport includes a four-point proof strip.
- Immediately below hero: three professional routes — Research, Engineering, Teaching.
- No nested scrolling, pinned sections or horizontal scroll experiences.
- Square corners by default; no gratuitous card radius.
- Section rhythm is compact enough that the homepage feels informative, not theatrical.

## Motion
- Native vertical scrolling only.
- Hero uses short one-time staggered entrances.
- Section reveals are one-time IntersectionObserver transitions using opacity + <=14px translateY.
- Hover displacement stays <=3px.
- Reading-progress line is requestAnimationFrame-throttled.
- No GSAP, Lenis, canvas, WebGL or continuous loops.
- Respect prefers-reduced-motion and render final states immediately.

## Interaction
- Visible keyboard focus.
- Primary CTAs use 44px minimum touch targets.
- Native details/summary for the secondary teaching studio.
- Active desktop navigation reflects the viewed section.

## Homepage hierarchy
1. Name + role + research focus + concise value proposition + proof strip + portrait + CTAs
2. Three-way professional snapshot: Research / Engineering / Teaching
3. Three core thesis papers + compact current research index
4. Three selected project case studies + GitHub archive
5. Two teaching roles + optional interactive teaching studio
6. About + contact + CV / Scholar / GitHub / LinkedIn
