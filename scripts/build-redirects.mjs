#!/usr/bin/env node
/**
 * Publish approved historical 301 redirects ONLY when their target is a
 * generated static HTML page. Every old route is checked against the
 * generated pages, so staging never redirects visitors into a missing URL.
 *
 * Output: dist/_redirects (Cloudflare Pages format)
 * Scope: new gorgeous2 build, not the existing production Bubble app.
 */
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {join,relative,resolve} from 'node:path';

async function htmlRoutes(base,here=base){
  const routes=[];
  for(const e of await readdir(here,{withFileTypes:true})){
    const path=join(here,e.name);
    if(e.isDirectory())routes.push(...await htmlRoutes(base,path));
    else if(e.name.endsWith('.html')){
      const rel=relative(base,path).replaceAll('\\','/');
      routes.push(rel==='index.html' ? '/' : '/'+rel.replace(/\/index\.html$/,'/').replace(/\.html$/,'/'));
    }
  }
  return routes;
}
export function selectDeployableRules(mappings, htmlPaths){
  const pages=new Set(htmlPaths);
  const active=[],deferred=[],invalid=[];
  const already=new Set();
  const normalize=p=>p==='/'?'/':(p.endsWith('/')?p:p+'/');
  for(const [rawSource,rawDestination] of Object.entries(mappings)){
    if(!rawSource.startsWith('/')||rawSource.includes('?')||/\s/.test(rawSource)||!rawDestination.startsWith('/')){
      invalid.push({from:rawSource,to:rawDestination,reason:'not a simple local path'});continue;
    }
    const target=rawDestination.split('#')[0].split('?')[0];
    if(!pages.has(normalize(target))){
      deferred.push({from:rawSource,to:rawDestination,reason:'destination not generated yet'});
      continue;
    }
    const paths=[rawSource];
    if(rawSource!=='/'&&!rawSource.endsWith('/'))paths.push(rawSource+'/');
    for(const source of paths){
      if(pages.has(normalize(source))){
        invalid.push({from:source,to:rawDestination,reason:'source is a real generated HTML page'});
        continue;
      }
      // Cloudflare Pages _redirects accepts space-delimited paths.
      // Escape spaces and non-ASCII characters, preserving %xx tokens.
      const sourceEncoded=encodeURI(source).replace(/%25([0-9A-Fa-f]{2})/g,'%$1');
      const destinationEncoded=encodeURI(rawDestination).replace(/%25([0-9A-Fa-f]{2})/g,'%$1');
      if(already.has(sourceEncoded))continue;
      already.add(sourceEncoded);
      active.push({from:sourceEncoded,to:destinationEncoded,status:301});
    }
  }
  return {active,deferred,invalid};
}
const isCLI=process.argv[1] && import.meta.url===new URL('file://'+resolve(process.argv[1])).href;
if(isCLI){
  try{
    const redirects=JSON.parse(await readFile('migration/redirects.json','utf8'));
    const routes=await htmlRoutes('dist');
    const output=selectDeployableRules(redirects,routes);
    const lines=['# Historical Gorgeous Clinic 301s. Generated after Astro build.',
      '# Only redirect to existing gorgeous2 HTML pages; remaining rules are deferred.',
      ...output.active.map(r=>r.from+' '+r.to+' '+r.status)];
    await writeFile('dist/_redirects',lines.join('\n')+'\n');
    console.log('301 redirects in this build: '+output.active.length+' rules, '+output.deferred.length+' legacy sources deferred, '+output.invalid.length+' excluded for safety.');
    if(output.invalid.length)console.log('Excluded examples: '+JSON.stringify(output.invalid.slice(0,6)));
  }catch(err){console.error(err);process.exitCode=1;}
}
