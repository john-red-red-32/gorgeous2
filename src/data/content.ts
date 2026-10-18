/**
 * GORGEOUS2 clinic treatment catalogue.
 * 75 original treatment routes aligned with the 75 Bubble rows exported Oct 18 2026.
 * Bubble omitted treatment display-title / Unique ID / full descriptive columns
 * from the CSV, so section bodies and FAQ associations are matched cautiously
 * against their human-readable parent names. The corresponding route is not guessed.
 */
import originalRows from './imported/treatments.json';
import sourceSections from './imported/treatment-sections.json';
import sourceFaqs from './imported/treatment-faqs.json';

export type TreatmentSection = { title:string; body:string; imageUrl:string; type:string; order:number|null; sourceRow:number };
export type TreatmentFaq = { question:string;answer:string;position:number|null;sourceRow:number };
export type Treatment = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  introduction: string;
  benefits: string[];
  anaesthetic?:string;
  bookingUrl?:string;
  heroAssetRef?:string;
  childOf?:string;
  childPosition?:number;
  sections?:TreatmentSection[];
  faqs?:TreatmentFaq[];
  sourceRow?:number;
};
export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  intro: string;
  sections: { title: string; body: string }[];
};

/** Specific name matches independently established by source-section headings. */
const knownDisplayNames:Record<string,string> = {
  'thread-lifts-pdo-pla':'Expert PDO Thread Lift',
  'anti-wrinkle-injections':'Anti-wrinkle / B’tox',
  'lip-enhancements':'Natural Lip Enhancements',
  'fat-dissolving-injections':'Fat Dissolving (AQUALYX®)',
  'collagen-inductiontherapy':'Collagen Induction Therapy (CIT)',
  'injectable-moisturisers-1':'Injectable Moisturisers & Skin Boosters',
  'anti-fluid-retention-eyes':'Under-Eye Anti-Fluid Retention Treatment',
  'hyaluronic-acid-dermal-filler-volume':'Dermal Filler (Hyaluronic Acid & Advanced Fillers)',
  'hyaluronic-acid-dermal-filler':'Dermal Filler: Lower 2/3 of Face',
  'upper-third-temple-filler':'Dermal Filler: Upper 1/3 of Face',
  'non-surgical-face-lift-1':"Non-Surgical Facelift (Dermal Filler + B'Tox)",
  'platelet-rich-plasma-prp':'Platelet-Rich Plasma (PRP) Therapy',
  'chemical-peels-1':'Resurfacing Chemical Peels',
  'plla-poly-l-lactic-acid-sculptra-aesplla':'PLLA (Poly-L-Lactic Acid) Treatment – Sculptra® / AesPLLA',
  'subcision-acne-scarring-1':'Subcision',
  'hyperhidrosis-sweat-control-injections':'Toxin for Hyperhidrosis (Anti-Sweat Treatment)',
  'toxin-for-jawline-slimming--teeth-grinding-1765307099206x629520527693213200':'Toxin for Jawline Slimming / Teeth Grinding',
  'under-eye-brightening-treatment-polynucleotides-1765302897850x815775285912820200':'Under-Eye Brightening Treatment (Polynucleotides)',
  'polynucleotides-bio-regenerative-skin-repair-1765302780960x576845951999288800':'Polynucleotides (Bio-Regenerative Skin Repair)',
  'prp-for-hair-restoration-1765309605238x422875589125000450':'PRP for Hair Restoration',
  'prp-for-skin-rejuvenation-1765309674238x127511390752498290':'PRP for Skin Rejuvenation',
  'temple-revolumisation-1765308723112x953852281526645600':'Temple Revolumisation',
  'forehead-revolumisation-1765308796436x204344993782369380':'Forehead Revolumisation',
  'midface-reconstruction-cheek-filler':'Midface Reconstruction (Cheek Filler)',
  'active-acne-peel-1765640746293x377513566426518340':'Active Acne Peel',
  'radiesse-calcium-hydroxylapatite':'Radiesse© Dermal Filler',
  'view-our-treatments':'View Our Treatments'
};
function readableName(slug:string):string {
  const base=slug.replace(/-\d{12,}x\d+$/,'').replace(/-/g,' ').replace(/ +/g,' ').trim();
  return base.replace(/\b\w/g,c=>c.toUpperCase()).replace(/\bPrp\b/g,'PRP').replace(/\bPlla\b/g,'PLLA').replace(/\bBtox\b/g,'Btox');
}
function normaliseName(s:string):string {
  return s.toLowerCase().normalize('NFKD').replace(/[’‘]/g,"'").replace(/[®©]/g,'')
    .replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
}
function parentContains(parents:string,name:string):boolean {
  // Bubble serialises linked things as a comma-space list; check whole names,
  // not substrings (to prevent 'Lip' matching unrelated treatment names).
  const desired=normaliseName(name);
  return parents.split(/\s+,\s+/).some(item=>normaliseName(item)===desired);
}
function shortIntro(text:string):string {
  const first=(text||'').replace(/\s+/g,' ').trim();
  const sentences=first.match(/^.{35,240}?[.!?](?=\s|$)/);
  return (sentences?.[0]||first.slice(0,210)).trim();
}
export const treatments:Treatment[] = originalRows.map(r=>{
  const name=knownDisplayNames[r.slug]||readableName(r.slug);
  const sections=sourceSections.filter(s=>parentContains(s.parentNamesRaw,name))
    .map(s=>({title:s.title,body:s.body,imageUrl:s.imageUrl,type:s.type,order:s.order,sourceRow:s.exportRow}))
    .sort((a,b)=>(a.order??999)-(b.order??999) || a.sourceRow-b.sourceRow);
  const faqs=sourceFaqs.filter(q=>parentContains(q.treatmentNamesRaw,name))
    .map(q=>({question:q.question,answer:q.answer,position:q.position,sourceRow:q.exportRow}))
    .sort((a,b)=>(a.position??999)-(b.position??999)||a.sourceRow-b.sourceRow);
  const intro=sections.find(s=>s.type==='Title_and_body' && s.body)?.body||'';
  return {
    slug:r.slug,name,category:r.categories.split(/\s+,\s+/).filter(c=>c&&!c.includes('deleted'))[0]||'Medical aesthetics',
    summary:intro?shortIntro(intro):'Explore this treatment with The Gorgeous Clinic. Learn about your options and book a free consultation.',
    introduction:intro,
    benefits:[],anaesthetic:r.anaesthetic,bookingUrl:r.bookingUrl,heroAssetRef:r.heroAssetRef,
    childOf:r.childOf,childPosition:Number(r.childPosition)||undefined,sections,faqs,sourceRow:r.sourceRow
  };
});

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
