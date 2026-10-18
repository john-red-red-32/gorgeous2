# The Gorgeous Clinic · gorgeous2

A clean, static-first rebuild of The Gorgeous Clinic website, designed for Cloudflare Pages and SEO-safe migration from Bubble.

**Status:** early prototype. The existing Bubble site and domain are not affected. Preview is deliberately `noindex` until a complete URL/content audit and launch decision.

## Development

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

Cloudflare Pages settings: framework **Astro**, build command `npm run build`, output directory `dist`, production branch `main`. Connect this GitHub repository in Cloudflare Workers & Pages to enable a preview domain.

## Content

Initial treatment/article records are **sample data**, not migrated Bubble exports. Their public URL slugs are deliberately kept compatible with the URLs already in use. Before launch, replace each stub with the exact approved Bubble content, photography, pricing and Vimeo references. Assets currently using Bubble CDN are temporary: migrate to owned storage before DNS cutover.

## Migration gates

- Import complete treatments, blog articles, gallery, metadata and canonical paths.
- Verify old-to-new URL mapping and required 301 redirects.
- Verify H1, rendered HTML, canonical, structured data and internal links for each template.
- Remove staging robots/noindex only on the approved launch deployment.
- **Do not point thegorgeousclinic.co.uk at this project until signed off.**
