import { treatments } from './content';
import { articlesForTreatment as findRelatedArticles } from './article-links';
import { galleryForTreatment } from './gallery';
import originalConcernRows from './imported/original-concerns.json';

/**
 * Single source of truth for concern-to-treatment discovery.
 * Concern-to-treatment relevance is a curated educational index; the public treatment routes come from the real Bubble export. Exact clinic-approved concern tagging is still awaiting export.
 * Never turn empty matches into made-up recommendations.
 */
export type Concern = {
  slug: string;
  name: string;
  description: string;
  explainer: string;
  image?: string;
  treatmentSlugs: string[];
};
export const concerns: Concern[] = originalConcernRows.map(row=>({slug:row.slug,name:row.name,description:row.description,explainer:row.explainer,image:row.image,treatmentSlugs:row.treatmentSlugs}));

export type TreatmentRelationship = {
  treatmentSlug: string;
  articleSlugs: string[];
  gallerySlugs: string[];
  videoIds: string[];
  concernSlugs: string[];
  priceLines: { name: string; gbp: number }[];
};
export const treatmentRelationships: TreatmentRelationship[] = treatments.map(t => ({
  treatmentSlug: t.slug,
  articleSlugs: findRelatedArticles(t.slug,5).map(a=>a.slug),
  gallerySlugs: galleryForTreatment(t.slug).map(g=>g.slug), // Restored media descriptions; crosslinks remain auditable.
  videoIds: [], // Vimeo IDs from Bubble.
  concernSlugs: concerns.filter(c => c.treatmentSlugs.includes(t.slug)).map(c => c.slug),
  priceLines: [] // Only add amounts verified in Bubble; never infer prices.
}));
export function findConcern(slug: string) { return concerns.find(c => c.slug === slug); }
export function findTreatment(slug: string) { return treatments.find(t => t.slug === slug); }
export function treatmentsForConcern(slug: string) {
  const item = findConcern(slug);
  return item ? item.treatmentSlugs.map(findTreatment).filter((t): t is typeof treatments[number] => !!t) : [];
}
export const articlesForTreatment=findRelatedArticles;
export function concernsForTreatment(slug: string) {
  return concerns.filter(c => c.treatmentSlugs.includes(slug));
}
export function matchConcerns(slugs: string[]) {
  const count = new Map<string, number>();
  slugs.forEach(slug => treatmentsForConcern(slug).forEach(t => count.set(t.slug, (count.get(t.slug) || 0) + 1)));
  return [...count.entries()]
    .sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([slug, score]) => ({ treatment: findTreatment(slug)!, score }));
}
export const catalogueStatus = 'All 34 original concern cards and 75 treatment URLs are now restored. Treatment matches are an initial educational index while original Bubble relationship IDs are being verified.';
