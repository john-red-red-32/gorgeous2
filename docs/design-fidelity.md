# Design fidelity · The Gorgeous Clinic

The goal is **a close, recognisable recreation of the existing thegorgeousclinic.co.uk**, not a redesign. Improvements to technical architecture and search indexing must not come at the expense of the owner's visual identity.

## Observed live references · 18 October 2026

- Homepage: https://thegorgeousclinic.co.uk/
- Treatment directory: https://thegorgeousclinic.co.uk/treatments/
- Knowledge hub: https://thegorgeousclinic.co.uk/blog-posts/
- Gallery: https://thegorgeousclinic.co.uk/gallery/
- Videos: https://thegorgeousclinic.co.uk/videos/
- Academy: https://thegorgeousclinic.co.uk/explore-academy/

## Design traits to preserve

1. **Hero:** full-height dark forest-green block, very large actual white circular Gorgeous Clinic logo, small centre-top navigation with pill-style Training Academy and Free Consultation links, subtly curved lower edge into near-white content. Do not replace this with a generic left-text/right-image landing-page hero.
2. **Typography:** live page computed fonts: Playfair Display for H1/H2, Inter for body and navigation. Warm brown/dark ink text on nearly white background, not cold blue-black.
3. **Main intro:** centred small-to-medium serif headline 'The Fylde Coast's Highest Rated Medical Aesthetics Clinic', followed by 1,000+ review line, side-logo/award and concise intro on the right. Compact pill buttons rather than large square CTAs.
4. **Navigation:** original simple Home / Treatments / Gallery / Contact, separate gold Training Academy and cream Free Consultation pills. Keep pages free of intrusive/sticky generic headers.
5. **Concern discovery:** horizontally browsable small round concern chips; beneath them, groups of modest white rounded rectangular buttons with soft outlines/shadows for navigation.
6. **Story sections:** restrained white/cream full-width sections with photographs, personal clinic copy and well-spaced serif headings. Preserve human, personal tone.
7. **Treatment directory:** narrow decorative photo/banner at page top; small circular clinic medallion overlapping transition; centred 'Treatments' heading; light sage search tab bar with Area of concern / Treatment List / Price List; two-column white concern cards with real line illustrations.
8. **Knowledge hub:** same decorative banner and medallion, centred 'Knowledge Hub' serif heading and single-paragraph intro, generous white space, A-Z blog index.
9. **Gallery and videos:** retain the real approved before-and-after photographs, Vimeo videos and original client-facing copy. Never invent client results.
10. **Mobile:** adapt the proportions respectfully rather than inserting an entirely different aesthetic.

## Assets

Currently, some images and logo assets load from the existing Bubble CDN. These are temporary staging dependencies; during the Bubble CSV/media migration, replace them with copies in controlled hosting or repository assets, retaining original attribution and correct image dimensions.

## SEO invariant

- Render article and treatment content as actual static HTML.
- One real H1 per page. Canonical tags, meta description, structured data and accessible links in page source.
- Preserve original content, original slugs, internal links and approved wording at import.
- Keep preview blocked from indexing until launch is signed off.
- Prefer design-fidelity improvements *within* these constraints.

## Remaining work

- Exact original decorative banner image and page background assets.
- Original review imagery, real photos, gallery & client videos, complete treatment/blog exports.
- More detailed typography/spacing audits on treatment-detail, gallery, video, contacts and mobile views.
- Replace all temporary content with the actual Bubble exports, not reconstructed or invented text.
- Complete media migration and smoke-test all routes before live DNS cutover.
