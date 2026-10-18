# Bubble relational export migration

Each Bubble data type arrives as a separate CSV. Many rows are child records attached to a parent `Unique ID`, for example Treatment Section → Treatment.

## Migration invariants

- Keep every Bubble Unique ID EXACTLY as a string. Do not infer an ID from a slug, title or filename.
- Keep the full public URL paths from `migration/snapshots/*.json`, including legacy punctuation and generated suffixes.
- A separate validated join table will link treatment sections, concerns, gallery, posts, video and pricing to treatments.
- Preserve order, original approved HTML, image addresses, Vimeo IDs and SEO fields on import.
- Detect missing parent IDs, duplicate IDs, broken links and unpublished references before cutover.
- Do not guess missing prices, treatments or relationships.
- Stage exports under `private/`; this GitHub repository is public. Never publish client records, contact information, appointment details or private consultation data.

## Inspect incoming files

Create a local `private/bubble-exports/` folder and place the exported public-content CSVs there. Run:

    node scripts/inspect-bubble-exports.mjs private/bubble-exports --out private/inspection.json
    npm run test:import

The inspector currently reports dataset row counts, headers, potential reference columns and unique ID issues; it does **not** print individual records, and it does not alter website content.

After inspecting the actual export headers, create a deterministic mapping per Bubble type. No mapping will be assumed without looking at the export.
