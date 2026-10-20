import {blogImageUrl} from './blog-media';
import importedBlogPosts from './imported/blog-posts.json';
import importedBlogSections from './imported/blog-sections.json';
import importedBlogReferences from './imported/blog-references.json';
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
export type ArticleSection = {title:string;body:string;image:string;order:number;sourceRow:number};
export type ArticleReference = {number:number|null;title:string;url:string};
export type Article = {
 slug:string;title:string;description:string;category:string;contentType:'Clinic'|'Academy';
 intro:string;heroImage:string;author:string|null;sourceParentId:string;sourceRow:number;
 sections:ArticleSection[];references:ArticleReference[];
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


/** Every article (106), section (525) and reference (531) is sourced from
 * its original Bubble CSV and mapped to the published sitemap URL.
 * Publishing date and original meta description were not present in this export.
 * No publication date is fabricated.
 */
const sectionsByPost=new Map<string,ArticleSection[]>();
for(const s of importedBlogSections){
 const list=sectionsByPost.get(s.sourceParentId)||[];
 list.push({title:s.title,body:s.body,image:blogImageUrl(s.image),order:s.order,sourceRow:s.sourceRow});
 sectionsByPost.set(s.sourceParentId,list);
}
const referencesByPost=new Map<string,ArticleReference[]>();
for(const r of importedBlogReferences){
 const list=referencesByPost.get(r.sourceParentId)||[];
 list.push({number:r.number,title:r.title,url:r.url});
 referencesByPost.set(r.sourceParentId,list);
}
function getExcerpt(body:string,max=155):string {
 const clean=body.replace(/\s+/g,' ').trim();
 if(clean.length<=max)return clean;
 const end=clean.lastIndexOf(' ',max);
 return clean.slice(0,end>max-30?end:max).replace(/[,;:]$/,'')+'.';
}
function categoryFor(title:string,contentType:string):string {
 const t=title.toLowerCase();
 if(contentType==='Academy')return 'Aesthetics education';
 if(/lip filler|lip enhancement|lip lines|lips/.test(t))return 'Lip enhancements';
 if(/anti.wrinkle|botox|brow|frown|masseter|jawtox|toxin/.test(t))return 'Anti-wrinkle treatments';
 if(/prp|polynucleotide|skin booster|profhilo|regenerative/.test(t))return 'Regenerative aesthetics';
 if(/fat dissolv|aqualyx|weight loss/.test(t))return 'Facial and body contouring';
 if(/chemical peel|microneedl|acne|collagen|pigmentation|sun damage|skin care/.test(t))return 'Skin health';
 if(/dermal filler|chin filler|temple filler|cheek filler|under.eye|jawline|facelift|face lift/.test(t))return 'Dermal fillers and facial balance';
 return 'Clinic knowledge';
}
export const articles:Article[]=importedBlogPosts.map(p=>{
 const sections=(sectionsByPost.get(p.sourceParentId)||[]).slice().sort((a,b)=>a.order-b.order||a.sourceRow-b.sourceRow);
 return{
  slug:p.slug,title:p.title,description:getExcerpt(p.intro||sections[0]?.body||''),
  category:categoryFor(p.title,p.contentType),
  contentType:p.contentType==='Academy'?'Academy':'Clinic',
  intro:p.intro,heroImage:blogImageUrl(p.heroImage),author:p.author,
  sourceParentId:p.sourceParentId,sourceRow:p.sourceRow,
  sections,references:(referencesByPost.get(p.sourceParentId)||[]).slice().sort((a,b)=>(a.number??999)-(b.number??999))
 };
});

export const bookingUrl = 'https://www.fresha.com/a/the-gorgeous-clinic-blackpool-221-whitegate-drive-a4km7ley/booking?menu=true&share=true&pId=812794&dppub=true';
export const whatsappUrl = 'https://wa.me/441253928029';
