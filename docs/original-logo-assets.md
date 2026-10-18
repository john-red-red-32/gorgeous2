# Original Gorgeous Clinic logo asset guide

Four *distinct* supplied logo files must not be conflated when recreating the original site.

| Supplied filename | Dimensions | Background | Intended use |
| --- | --- | --- | --- |
| `2 white.png` | 1841 × 1146 | Transparent | **Primary original white logo**, including rings; use over forest-green hero and other dark sections |
| `Modified white logo no rings.png` | 1841 × 881 | Transparent | **Compact white wordmark without rings**: only when scroll-state header becomes shorter |
| `Untitled design (1).png` | 1080 × 1080 | Opaque forest green `#2B4A34` | Precomposed branded square with white full logo; suitable for boxed backgrounds, previews and selected decorative medallions |
| `black.png` | 1841 × 1146 | Transparent | **Dark version of full ringed logo**, for light backgrounds |

Current staging homepage already uses the original white and green logo variants through their corresponding Bubble CDN source URLs. Those existing references are **temporary**. The user's four *actual original uploaded files* remain the authoritative source for the eventual self-hosted `public/brand/` copies. The compact and black variants have not yet been moved into GitHub; do not silently replace either with a CSS imitation.

Brand green verified from the supplied green-background asset: **#2B4A34**. Preserve the logo's natural proportions and transparency; never force a square crop on the primary transparent white/black wordmarks.

Image optimization guidance: provide correctly sized WEBP derivatives for layouts, but keep full-resolution PNG masters once the originals are transferred. Avoid recompressing the vector-like lettering excessively.
