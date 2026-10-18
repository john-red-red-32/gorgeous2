import gallerySource from './imported/gallery.json';

export type GalleryEntry = typeof gallerySource[number] & {title:string;treatmentSlugs:string[]};

/** A narrow, auditable relationship index based on explicit treatment terms
 * in the original gallery description. This is NOT a reconstruction of
 * Bubble's hidden relation IDs, which were absent from the 7-column export.
 */
const termMatchers:{test:RegExp;slugs:string[]}[] = [
 {test:/lip flip/i,slugs:['lip-flip-toxin-for-upper-lip-eversion-1765449396700x877356619784857900']},
 {test:/lip enhancement|lip filler|lip volume|lip contour/i,slugs:['lip-enhancements']},
 {test:/anti.wrinkle|wrinkle.relax|botulinum toxin|b.tox|forehead lines|frown lines/i,slugs:['anti-wrinkle-injections']},
 {test:/thread lift|pdo thread|cog thread|tightening threads/i,slugs:['thread-lifts-pdo-pla']},
 {test:/non.surgical face.?lift|full.face rejuv|full.face rejuvenation/i,slugs:['non-surgical-face-lift-1']},
 {test:/under.eye puffiness|fluid retention|eye bag/i,slugs:['anti-fluid-retention-eyes']},
 {test:/under.eye brightening|polynucleotide/i,slugs:['under-eye-brightening-treatment-polynucleotides-1765302897850x815775285912820200']},
 {test:/microneedling|micro needling|collagen induction/i,slugs:['collagen-inductiontherapy']},
 {test:/chemical peel|salicylic|resurfacing peel/i,slugs:['chemical-peels-1']},
 {test:/deep depigmentation|melasma|depigmentation peel/i,slugs:['depigmentation-peels-1765640437952x882826730501800700']},
 {test:/chin fat|fat dissolving|aqualyx/i,slugs:['fat-dissolving-injections']},
 {test:/hyaluronic acid filler|cheek filler|temple filler|facial filler/i,slugs:['hyaluronic-acid-dermal-filler-volume']},
 {test:/prp therapy|platelet.rich plasma|vampire facial/i,slugs:['platelet-rich-plasma-prp']},
 {test:/subcision/i,slugs:['subcision-acne-scarring-1']},
 {test:/jawline slimming|masseter/i,slugs:['toxin-for-jawline-slimming--teeth-grinding-1765307099206x629520527693213200']}
];
function heading(slug:string):string {
  return slug.replace(/-\d{12,}x\d+$/,'').replace(/-/g,' ').replace(/\s+/g,' ').trim()
    .replace(/\b\w/g,s=>s.toUpperCase()).replace(/\bPdo\b/g,'PDO').replace(/\bPrp\b/g,'PRP');
}
export const gallery:GalleryEntry[]=gallerySource.map(item=>{
  const copy=[item.slug,item.alt,item.body].join(' ');
  const links=[...new Set(termMatchers.filter(rule=>rule.test.test(copy)).flatMap(rule=>rule.slugs))];
  return {...item,title:heading(item.slug),treatmentSlugs:links};
});
export const galleryBySlug=new Map(gallery.map(item=>[item.slug,item]));
export function galleryForTreatment(slug:string):GalleryEntry[]{
  return gallery.filter(item=>item.treatmentSlugs.includes(slug));
}
