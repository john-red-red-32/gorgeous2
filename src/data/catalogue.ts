import { treatments, articles } from './content';

/**
 * Single source of truth for concern-to-treatment discovery.
 * All relationships in this initial file are PROVISIONAL, pending the Bubble export.
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
const bubbleImg = 'https://8eb147f7d859a9618e57d27ae5aa5933.cdn.bubble.io/';
export const concerns: Concern[] = [
  {
    slug: 'lines-and-wrinkles', name: 'Lines & Wrinkles',
    description: 'Fine lines and expression lines around the eyes, forehead and mouth.',
    explainer: 'Different lines can have different causes. Some are most noticeable when facial muscles move; others can involve changes to the skin itself. Understanding the difference is a useful starting point when exploring treatment options.',
    image: bubbleImg + 'f1765454945166x911527603846544800/ChatGPT%20Image%20Dec%2011%2C%202025%2C%2011_56_45%20AM.png',
    treatmentSlugs: ['anti-wrinkle-injections']
  },
  {
    slug: 'jowls', name: 'Jowls',
    description: 'Changes in fullness or definition along the lower face and jaw.',
    explainer: 'Jowls can be related to several changes in the lower face. The most useful options depend on whether the concern is skin laxity, facial volume or another aspect of facial structure.',
    image: bubbleImg + 'f1765455527885x750352559496446600/ChatGPT%20Image%20Dec%2011%2C%202025%2C%2012_18_39%20PM.png',
    treatmentSlugs: []
  },
  {
    slug: 'lip-lines', name: 'Lip Lines',
    description: 'Lines around the lips, sometimes called perioral lines.',
    explainer: 'Lines around the mouth can relate to skin changes and repeated facial movement. Treatment choices depend on the underlying cause rather than a single product.',
    image: bubbleImg + 'f1765208380728x258805943997262750/ChatGPT%20Image%20Dec%207%2C%202025%2C%2006_46_14%20PM.png',
    treatmentSlugs: []
  },
  {
    slug: 'sagging-skin', name: 'Sagging Skin',
    description: 'A change in skin firmness or elasticity on the face or neck.',
    explainer: 'Changes in firmness can be influenced by skin quality and facial structure. Not every treatment intended for fine lines also addresses laxity.',
    image: bubbleImg + 'f1765207334107x591207324493823000/ChatGPT%20Image%20Dec%207%2C%202025%2C%2006_52_13%20PM.png',
    treatmentSlugs: []
  },
  {
    slug: 'lip-volume', name: 'Lip Volume',
    description: 'Lips that feel naturally thin or have lost some fullness.',
    explainer: 'Lip enhancement can focus on proportion, definition or volume. The ideal approach depends on lip anatomy and what kind of change, if any, someone actually wants.',
    image: bubbleImg + 'f1765207343851x160040545009242140/ChatGPT%20Image%20Dec%207%2C%202025%2C%2003_55_58%20PM.png',
    treatmentSlugs: ['lip-enhancements']
  },
  {
    slug: 'jawline-definition', name: 'Jawline Definition',
    description: 'A less defined lower-face profile or jawline.',
    explainer: 'Jawline definition can be influenced by bone structure, skin, facial volume and muscle. These are not interchangeable concerns, so a one-size-fits-all answer is rarely useful.',
    image: bubbleImg + 'f1765207360107x602448429123216900/ChatGPT%20Image%20Dec%207%2C%202025%2C%2006_54_39%20PM.png',
    treatmentSlugs: ['hyaluronic-acid-dermal-filler-volume']
  },
  {
    slug: 'pigmentation', name: 'Pigmentation',
    description: 'Uneven skin tone, dark spots or sun-related colour changes.',
    explainer: 'There are different causes of uneven pigmentation. Identifying the pattern and history helps determine which skin approaches are appropriate.',
    image: bubbleImg + 'f1765207369655x351026390638250940/ChatGPT%20Image%20Dec%207%2C%202025%2C%2006_36_28%20AM.png',
    treatmentSlugs: []
  },
  {
    slug: 'chin-fullness', name: 'Chin Fullness',
    description: 'Fullness beneath the chin or a softer profile.',
    explainer: 'Fullness around the chin may relate to several factors. A consultation helps distinguish them and whether there is a suitable treatment option.',
    image: bubbleImg + 'f1765207397798x164350819343333860/ChatGPT%20Image%20Dec%207%2C%202025%2C%2004_48_07%20PM.png',
    treatmentSlugs: ['fat-dissolving-injections']
  },
  {
    slug: 'facial-volume-loss', name: 'Facial Volume Loss',
    description: 'A hollowed appearance around the cheeks, temples or lower face.',
    explainer: 'Changes in facial volume are not the same as changes in skin texture. A consultation can help separate the two and explore relevant treatment categories.',
    image: bubbleImg + 'f1765207386725x499974064118120500/ChatGPT%20Image%20Dec%207%2C%202025%2C%2004_01_15%20PM.png',
    treatmentSlugs: ['hyaluronic-acid-dermal-filler-volume']
  },
  {
    slug: 'acne-and-breakouts', name: 'Acne & Breakouts',
    description: 'Blemishes, breakouts and concerns about skin clarity.',
    explainer: 'The causes of breakouts vary, and treating the skin without understanding its condition can be counterproductive. Start with a clear assessment.',
    image: bubbleImg + 'f1765207423836x983510275028990300/ChatGPT%20Image%20Dec%207%2C%202025%2C%2006_47_53%20PM.png',
    treatmentSlugs: []
  },
  {
    slug: 'under-eye-concerns', name: 'Under-Eye Concerns',
    description: 'Dark circles, visible hollows, puffiness or crepey skin.',
    explainer: 'Dark circles, morning puffiness, skin texture and structural hollows can look similar but have different causes. Exploring which feature concerns you most is more helpful than starting with a treatment name.',
    image: bubbleImg + 'f1765455154058x746100452471946800/ChatGPT%20Image%20Dec%2011%2C%202025%2C%2012_11_15%20PM.png',
    treatmentSlugs: []
  },
  {
    slug: 'teeth-grinding', name: 'Teeth Grinding',
    description: 'Jaw clenching, facial tension or grinding of teeth.',
    explainer: 'Jaw tension or grinding may have a number of causes. Understanding the pattern and symptoms is important before considering any treatment.',
    image: bubbleImg + 'f1765207443345x520648976564254340/ChatGPT%20Image%20Dec%207%2C%202025%2C%2006_47_53%20PM.png',
    treatmentSlugs: []
  }
];

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
  articleSlugs: t.slug === 'anti-wrinkle-injections'
    ? ['how-long-do-anti-wrinkle-injections-last-in-practice-1626']
    : t.slug === 'lip-enhancements'
      ? ['lip-filler-migration-what-it-looks-like-and-when-dissolving-may-help-26726']
      : [],
  gallerySlugs: [], // The Bubble export will populate these exact gallery IDs/slugs.
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
export function articlesForTreatment(slug: string) {
  const ids = treatmentRelationships.find(t => t.treatmentSlug === slug)?.articleSlugs || [];
  return ids.map(id => articles.find(a => a.slug === id)).filter((a): a is typeof articles[number] => !!a);
}
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
export const catalogueStatus = 'Staging preview — the complete clinic catalogue and mappings will be imported from Bubble.';
