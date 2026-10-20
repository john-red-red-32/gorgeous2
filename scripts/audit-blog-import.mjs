#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const [posts,sections,references,sitemap]=await Promise.all([
 read('src/data/imported/blog-posts.json'),
 read('src/data/imported/blog-sections.json'),
 read('src/data/imported/blog-references.json'),
 read('migration/snapshots/blog.json')
]);
function check(test,msg){if(!test)throw Error(msg);}
check(posts.length===106,'Expected 106 original blog posts');
check(sections.length===525,'Expected 525 article sections');
check(references.length===531,'Expected 531 source references');
check(sitemap.urls.length===posts.length,'Sitemap count differs from blog export');
const parentSet=new Set(posts.map(p=>p.sourceParentId));
check(parentSet.size===posts.length,'Parent section IDs assigned ambiguously');
const slugs=new Set();
for(let i=0;i<posts.length;i++){
 const p=posts[i],expected=new URL(sitemap.urls[i]);
 check(p.originalUrl===sitemap.urls[i],'Post '+(i+1)+' original URL mismatch');
 check(decodeURIComponent(expected.pathname).endsWith('/'+p.slug+'/'),'Post '+(i+1)+' slug changed');
 check(!slugs.has(p.slug),'Duplicate blog slug '+p.slug);
 slugs.add(p.slug);
 check(p.intro.trim().length>0,'Missing intro for '+p.slug);
 check(/^https:\/\//.test(p.heroImage),'Missing hero image for '+p.slug);
 check(sections.some(s=>s.sourceParentId===p.sourceParentId),'No sections for '+p.slug);
}
const orphans=sections.filter(s=>!parentSet.has(s.sourceParentId));
check(!orphans.length,orphans.length+' sections have no article parent');
check(sections.filter(s=>s.image).length===508,'Original section image count changed');
const sourceIds=new Set(sections.map(s=>s.sourceParentId));
const unassigned=references.filter(r=>!sourceIds.has(r.sourceParentId));
check(!unassigned.length,unassigned.length+' source references have no matching article');
check(posts[70].sourceParentId!==posts[71].sourceParentId,'Swapped Academy article section owner regression');
for(const slug of [posts[0].slug,posts[70].slug,posts[71].slug,posts[105].slug]){
 const html=await readFile('dist/blog/'+slug+'/index.html','utf8');
 check(html.includes('tgc-article-hero-image'),'Missing rendered hero image on '+slug);
 check(html.includes('tgc-article-section'),'Missing rendered content sections on '+slug);
 check(html.includes('Article'),'Missing JSON-LD Article schema '+slug);
}
const t=await readFile('dist/treatments/anti-wrinkle-injections/index.html','utf8');
check(t.includes('tgc-related-articles-bottom'),'Missing treatment related articles section');
check(t.includes('tgc-related-article-card'),'Missing article image links on treatment page');
const list=await readFile('dist/blog-posts/index.html','utf8');
check(list.includes('tgc-blog-post-grid') && list.includes('tgc-blog-type'),'Blog discovery filters missing');
console.log('Full original blog import validated: 106 posts, 525 sections, 106 hero images, 508 section images, 531 references.');
console.log('Verified preserved slugs, section parents, rendered HTML, image elements and treatment article crosslinks.');
