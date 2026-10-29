# Gorgeous2 — faithful migration of the original Bubble website

**Objective:** preserve the original clinic site's bespoke design, details, content, interactions and conversion paths while replacing Bubble's page serving with independent Astro/Cloudflare HTML.

## Automated capture

The workflow `.github/workflows/capture-bubble-reference.yml` records the public original website using a real Chromium browser: fully rendered DOM, desktop/mobile screenshots, computed styles and fonts, visible clickable controls, images, and a Playwright interaction trace of the treatments area.

An uploaded GitHub Actions artifact contains the full snapshots. Selected screenshots and control inventories are copied into `docs/reference-captures/` for reproducible visual comparison. The capture does not change the original website, submit forms or log into private pages.

## Preserve the original treatment experience

1. Original opening page, spacing, header, animations and scroll state.
2. Concern cards: selecting multiple concerns, showing results and presenting relevant treatments.
3. Browse treatment tabs: categories, search, selection states and smooth transitions.
4. Price list: grouping, links and dynamically displayed details.
5. Treatment sidebar: dimensions, typography, images, sections, videos, gallery, article links, scrolling and dismissal.
6. Original slug deep links and back/forward navigation.
7. Mobile version: responsive navigation and treatment drawer.
8. Free consultation CTAs, internal links, booking and analytics.

Add the new virtual consultation without sacrificing the original three ways to browse.

## Engineering method

Use browser snapshots to measure the design and describe workflows. Rebuild those workflows in Astro/CSS/JS using the Bubble-exported catalogue as the data source. Do not copy Bubble's proprietary runtime or rely on saved Bubble HTML for functional logic. The content of every treatment retains an independent server-rendered URL and can also be displayed client-side in the sidebar.

Original URLs, galleries, related articles, videos and pricing are linked by explicit validated relationships. Mirror the remaining treatment/gallery/logos assets so the new site does not depend on Bubble's CDN. Blog images are already mirrored.

## Safe cutover criteria

- Key desktop and mobile layouts and treatment interactions match the original.
- All 358 original blog/treatment/gallery/video URLs are accounted for: direct pages or correctly targeted 301s.
- Internal links, image availability, structured data, canonicals and sitemaps pass production-like checks.
- Booking, contact, conversion tracking and navigation work without Bubble.
- The new site stays noindex on staging; do not change Cloudflare's live routing until parity is satisfactory.
- Retain the original Bubble service through the switchover and verification period, with rollback available.

Changing the technology does not guarantee better rankings immediately; URL continuity and faithful content/experience are essential to protecting the recent improvement.
