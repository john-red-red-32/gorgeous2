#!/usr/bin/env node
/**
 * Verify that positional Bubble exports still match the original sitemap
 * snapshots. Throws on any loss of rows, changed slugs or duplicate URLs.
 */
import {readFile} from 'node:fs/promises';
const json=async file=>JSON.parse(await readFile(file,'utf8'));
function assert(value,message){if(!value)throw new Error(message);}
function path(url){return new URL(url).pathname;}
const [treatments,sections,faqs,gallery,treatmentSitemap,gallerySitemap]=await Promise.all([
json('src/data/imported/treatments.json'),json('src/data/imported/treatment-sections.json'),
json('src/data/imported/treatment-faqs.json'),json('src/data/imported/gallery.json'),
json('migration/snapshots/treatments.json'),json('migration/snapshots/gallery.json')
]);
assert(treatments.length===75,'Treatment import is not 75 records');
assert(sections.length===111,'Treatment sections import is not 111 records');
assert(faqs.length===35,'Treatment FAQs import is not 35 records');
assert(gallery.length===66,'Gallery import is not 66 records');
for(const [collection,sitemap,label] of [[treatments,treatmentSitemap,'treatment'],[gallery,gallerySitemap,'gallery']]){
 const paths=new Set();
 assert(collection.length===sitemap.urls.length,label+' sitemap length mismatch');
 for(let i=0;i<collection.length;i++){
  const row=collection[i],expected=path(sitemap.urls[i]);
  const actual=path(row.originalUrl);
  assert(actual===expected,label+' #'+(i+1)+': original route changed');
  assert(!paths.has(actual),label+' #'+(i+1)+': duplicate route '+actual);
  paths.add(actual);
  assert(actual.endsWith('/'+row.slug+'/'),label+' #'+(i+1)+': slug mismatch');
 }
}
assert(treatments[67].sourceRowBlank && treatments[67].slug==='view-our-treatments',
  'Important: Bubble export row #68 is blank; do not shift the positional join.');
assert(gallery.every(g=>/^https:\/\//.test(g.imageUrl)),
  'Gallery contains missing/non-https image URLs');
console.log('Imported treatment and gallery sitemap parity passed: 75 treatments + 66 gallery pages.');
console.log('Treatment sections: '+sections.length+'; FAQs: '+faqs.length+'.');
console.log('Source export caveat: Bubble Unique IDs, pricing and several title fields were not included in the seven exported columns.');
