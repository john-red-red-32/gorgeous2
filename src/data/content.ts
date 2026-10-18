/**
 * TEMPORARY PROTOTYPE DATA.
 * Replace with exact approved Bubble export before launch.
 * Preserved URL slugs below are already used by the existing site.
 */
export type Treatment = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  introduction: string;
  benefits: string[];
};
export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  intro: string;
  sections: { title: string; body: string }[];
};

export const treatments: Treatment[] = [
  {
    slug: 'anti-wrinkle-injections',
    name: 'Anti-Wrinkle Injections',
    category: 'Wrinkle relaxing',
    summary: 'Carefully planned treatment for expression lines, with natural movement and facial balance in mind.',
    introduction: 'Anti-wrinkle injections can help soften expression lines in suitable clients. Treatment starts with an assessment of your facial movement, goals and medical history.',
    benefits: ['Forehead lines', 'Frown lines', 'Crow’s feet', 'Individual consultation']
  },
  {
    slug: 'lip-enhancements',
    name: 'Lip Enhancements',
    category: 'Dermal filler',
    summary: 'A refined approach to lip shape and volume, from subtle restoration to carefully balanced enhancement.',
    introduction: 'Lip enhancement is about proportion as much as volume. Our consultation considers existing anatomy, symmetry, previous treatments and the result you hope to achieve.',
    benefits: ['Shape and definition', 'Volume restoration', 'Subtle lip enhancement', 'Aftercare and review']
  },
  {
    slug: 'hyaluronic-acid-dermal-filler-volume',
    name: 'Dermal Fillers',
    category: 'Dermal filler',
    summary: 'Thoughtful facial contouring and volume restoration, always guided by your individual features.',
    introduction: 'Hyaluronic acid dermal fillers can be used to address selected volume and contour concerns. Suitability depends on the treatment area and an in-person assessment.',
    benefits: ['Facial balance', 'Selected volume concerns', 'Profile and contour', 'Natural-looking planning']
  },
  {
    slug: 'fat-dissolving-injections',
    name: 'Fat Dissolving',
    category: 'Body and contour',
    summary: 'Consultation-led options for selected areas of localised fullness.',
    introduction: 'Fat-dissolving treatments are not suitable for everyone or every area. We assess whether the concern is fat, muscle, skin laxity or facial structure before making a recommendation.',
    benefits: ['Suitability assessment', 'Realistic expectations', 'Treatment planning', 'Clear aftercare']
  }
];

export const articles: Article[] = [
  {
    slug: 'how-long-do-anti-wrinkle-injections-last-in-practice-1626',
    title: 'How Long Do Anti-Wrinkle Injections Last in Practice?',
    description: 'A realistic look at anti-wrinkle treatment longevity, what affects results and when maintenance may be appropriate.',
    category: 'Anti-wrinkle',
    intro: 'One of the most common questions before anti-wrinkle treatment is how long the result will last. There is no single answer for everyone.',
    sections: [
      { title: 'Why results vary', body: 'Treatment area, muscle activity and individual response all affect how long lines stay softened. A careful assessment helps establish realistic expectations before treatment.' },
      { title: 'When movement returns', body: 'Results develop gradually and do not disappear overnight. Normal muscle movement returns over time, and maintenance needs depend on the individual.' },
      { title: 'Planning your next appointment', body: 'Your practitioner can advise on review timing, treatment goals and whether a repeat appointment is appropriate. The aim is consistency, not excessive treatment.' }
    ]
  },
  {
    slug: 'lip-filler-migration-what-it-looks-like-and-when-dissolving-may-help-26726',
    title: 'Lip Filler Migration: What It Looks Like',
    description: 'What migrated lip filler may look like, why it happens and when a professional assessment could help.',
    category: 'Lip filler',
    intro: 'Changes to the lip border or an unusual fullness above the lip can prompt questions about filler migration. It is important not to assume every change is migration.',
    sections: [
      { title: 'What migration means', body: 'Migration describes filler that is sitting outside its intended area. Swelling, natural anatomy and previous treatment can sometimes look similar, so assessment matters.' },
      { title: 'Why it can happen', body: 'Repeated treatment, tissue limits and placement decisions can contribute. A thorough history and examination help identify the likely cause.' },
      { title: 'When to seek advice', body: 'A practitioner can review the area and discuss appropriate options. Avoid attempting to massage or correct suspected migration yourself without professional guidance.' }
    ]
  }
];

export const bookingUrl = 'https://www.fresha.com/a/the-gorgeous-clinic-blackpool-221-whitegate-drive-a4km7ley/booking?menu=true&share=true&pId=812794&dppub=true';
export const whatsappUrl = 'https://wa.me/441253928029';
