# Previous-site 301 redirects and Google Ads tag

## Current status

- **Google Ads** tag ID: `AW-11114476947` provided by the clinic owner.
- The tag is included once via `src/components/GoogleAdsTag.astro`, loaded through the global layout.
- On `gorgeous2.pages.dev` it does not execute or load the remote Google script.
- It activates only when the rendered page runs at `thegorgeousclinic.co.uk` or `www.thegorgeousclinic.co.uk`.
- This is a **Google Ads** destination, not a Google Analytics 4 `G-...` measurement ID. No GA4 ID is assumed.
- **Legacy redirects not yet received**: `migration/redirects.json` is intentionally `{}`. Do not invent or publish redirects.

## Import previous 301 rules

Supported formats are Cloudflare `_redirects` syntax (`/old/ /new/ 301`), a two/three-column CSV, simple `from -> to` lines, and JSON map/array.

    node scripts/prepare-redirects.mjs private/previous-redirects.txt --out private/redirect-candidates.json
    npm run test:redirects

Exact duplicate rules for an identical source and destination are deduplicated.
Conflicting rules, wildcard source patterns, non-301 statuses, cross-domain destinations and redirect loops require manual review.
The importer does **not** activate proposed redirects or change any live Cloudflare routing.

## Before launch

1. Merge approved rules into `migration/redirects.json` (currently empty).
2. Check each source against the preserved sitemap snapshots in `migration/snapshots/`.
3. Keep old URLs whenever possible, rather than redirecting them unnecessarily.
4. Verify every redirect target exists as generated HTML, and test the real HTTP `301` responses.
5. Check no source URL has competing old and new redirect destinations.
6. Only then emit Cloudflare redirect rules into the production build.
