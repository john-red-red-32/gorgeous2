#!/usr/bin/env node
/**
 * One-off conversion of public Bubble blog media into static, self-hosted WebP
 * assets. Executed by .github/workflows/mirror-blog-media.yml, not regular build.
 * Any unsuccessful image remains available via the old Bubble URL as fallback.
 */
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import sharp from 'sharp';

const read=async file=>JSON.parse(await readFile(file,'utf8'));
const posts=await read('src/data/imported/blog-posts.json');
const sections=await read('src/data/imported/blog-sections.json');
const manifestPath='src/data/imported/blog-media-mirror.json';
const map=await read(manifestPath);
const all=[...new Set([
 ...posts.map(x=>x.heroImage),
 ...sections.map(x=>x.image).filter(Boolean)
])].filter(Boolean);
const sample=parseInt(process.env.SAMPLE_IMAGES||'0',10);
const urls=sample>0?all.slice(0,sample):all;
const maxBytes=25*1024*1024;
const concurrency=Number(process.env.MEDIA_CONCURRENCY)||5;
const output='public/media/blog';
await mkdir(output,{recursive:true});
let worked=0,failed=[],skipped=0;
const safeSource=input=>{
 try{
  const url=new URL(input);
  if(url.protocol!=='https:'||!url.hostname.endsWith('.cdn.bubble.io'))return null;
  return url;
 }catch{return null;}
};
async function mirror(original){
 const remote=safeSource(original);
 if(!remote){failed.push({source:original,error:'Unexpected source host/protocol'});return;}
 const digest=createHash('sha256').update(original).digest('hex').slice(0,24);
 const webpFile=join(output,digest+'.webp');
 const target='/media/blog/'+digest+'.webp';
 try{
  await access(webpFile);
  map[original]=target;skipped++;return;
 }catch{}
 let error='';
 for(let attempt=1;attempt<=3;attempt++){
  try{
   const result=await fetch(remote,{signal:AbortSignal.timeout(45000),headers:{'User-Agent':'GorgeousClinicContentMigration/1.0','Accept':'image/avif,image/webp,image/*'}});
   if(!result.ok)throw Error('HTTP '+result.status);
   const declared=Number(result.headers.get('content-length')||'0');
   if(declared>maxBytes)throw Error('Media larger than 25 MB');
   const type=result.headers.get('content-type')||'';
   if(!type.startsWith('image/')&&!['application/octet-stream',''].includes(type))throw Error('Not an image: '+type);
   const bytes=Buffer.from(await result.arrayBuffer());
   if(bytes.length>maxBytes)throw Error('Media larger than 25 MB');
   const image=sharp(bytes,{limitInputPixels:55_000_000,failOn:'error'});
   const meta=await image.metadata();
   if(!['jpeg','png','webp','avif','gif','tiff','heif','heic'].includes(meta.format||''))throw Error('Unsupported '+meta.format);
   await image.rotate().resize({width:1920,height:1920,fit:'inside',withoutEnlargement:true})
     .webp({quality:86,effort:4}).toFile(webpFile);
   map[original]=target;worked++;return;
  }catch(e){error=String(e);if(attempt<3)await new Promise(r=>setTimeout(r,attempt*850));}
 }
 failed.push({source:original,error});
}
let cursor=0;
async function worker(){
 while(cursor<urls.length){
  const item=urls[cursor++];
  await mirror(item);
  if((worked+skipped+failed.length)%50===0){
   console.log('Mirrored '+worked+', skipped '+skipped+', failed '+failed.length+' / '+urls.length);
  }
 }
}
await Promise.all(Array.from({length:Math.min(Math.max(1,concurrency),10)},()=>worker()));
await writeFile(manifestPath,JSON.stringify(map,null,2)+'\n');
await writeFile('migration/reports/blog-media-copy.json',JSON.stringify({
 migratedAt:new Date().toISOString(),uniqueSources:all.length,requested:urls.length,
 newFiles:worked,existingFiles:skipped,failed:failed.length,failures:failed
},null,2)+'\n');
console.log('Original media:',all.length,'requested',urls.length,'new',worked,'existing',skipped,'failed',failed.length);
if(failed.length)console.warn('Failed images retain their original source URL in the site:',JSON.stringify(failed.slice(0,8)));
if(failed.length>urls.length*.1)process.exitCode=1;
