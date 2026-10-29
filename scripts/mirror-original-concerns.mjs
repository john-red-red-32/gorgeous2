#!/usr/bin/env node
/* Mirror the 34 original Bubble concern illustrations into our own site.
 * The original captured image URLs were resized to 96px by Bubble's CDN.
 * This importer strips that resize transformation and requests the master.
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import sharp from 'sharp';

const input='src/data/imported/original-concerns.json';
const records=JSON.parse(await readFile(input,'utf8'));
if(records.length!==34)throw Error('Original concern list should contain 34 cards');
await mkdir('public/media/concerns',{recursive:true});
const errors=[];let copied=0;
for(const card of records){
 if(card.image.startsWith('/media/concerns/'))continue;
 try{
  const original=new URL(card.image);
  if(!original.protocol.startsWith('https')||!original.hostname.endsWith('.cdn.bubble.io'))
   throw Error('Unexpected source host');
  original.pathname=original.pathname.replace(/\/cdn-cgi\/image\/[^/]+\//,'/');
  const response=await fetch(original,{signal:AbortSignal.timeout(40000)});
  if(!response.ok)throw Error('HTTP '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length>18_000_000)throw Error('Image too large');
  const file='public/media/concerns/'+card.slug+'.webp';
  await sharp(bytes).rotate().resize({width:512,height:512,fit:'inside',withoutEnlargement:true})
    .webp({quality:86,effort:4}).toFile(file);
  card.image='/media/concerns/'+card.slug+'.webp';
  copied++;
 }catch(error){errors.push({slug:card.slug,error:String(error)});}
}
await writeFile(input,JSON.stringify(records,null,2)+'\n');
await mkdir('migration/reports',{recursive:true});
await writeFile('migration/reports/original-concern-images.json',JSON.stringify({total:records.length,copied,errors},null,2)+'\n');
console.log('Original concern art:',copied,'self-hosted,',errors.length,'failures');
if(errors.length)console.log(JSON.stringify(errors.slice(0,15)));
if(errors.length>0)process.exitCode=1;
