#!/usr/bin/env node
/*
 * Compare all original public content URLs with generated static HTML routes.
 * Advisory while migrating; pass --strict to require complete URL coverage.
 */
import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
const kinds=['blog','treatments','gallery','videos'];
async function allHtml(folder){
  const paths=[];
  for(const item of await readdir(folder,{withFileTypes:true})){
    const file=join(folder,item.name);
    if(item.isDirectory())paths.push(...await allHtml(file));
    else if(item.name.endsWith('.html'))paths.push(file);
  }
  return paths;
}
function pathOfOriginal(url) {
  return new URL(url).pathname;
}
function pathOfBuilt(file) {
  const clean=file.replace(/\\/g,'/').replace(/^dist\//,'');
  const route=clean==='index.html' ? '/' : '/'+clean.replace(/\/index\.html$/,'/').replace(/\.html$/,'/');
  return new URL(route,'https://thegorgeousclinic.co.uk').pathname;
}
export async function auditMigration(base='dist') {
  const routes=new Set((await allHtml(base)).map(file=>pathOfBuilt(file.replace(/\\/g,'/'))));
  const output={generatedPages:routes.size,kinds:{},missingCount:0,redirectedCount:0,coveredCount:0};
  let redirects={};
  try{redirects=JSON.parse(await readFile('migration/redirects.json','utf8'));}
  catch(error){if(error.code!=='ENOENT')throw error;}
  const seen=new Set();
  for(const kind of kinds){
    const snapshot=JSON.parse(await readFile('migration/snapshots/'+kind+'.json','utf8'));
    const urls=snapshot.urls||[];
    const missing=[],redirected=[],covered=[],duplicates=[];
    for(const url of urls){
      const path=pathOfOriginal(url);
      if(seen.has(path))duplicates.push(path);
      seen.add(path);
      if(routes.has(path))covered.push(path);
      else if(redirects[path] && routes.has(new URL(redirects[path],'https://thegorgeousclinic.co.uk').pathname))
        redirected.push({from:path,to:redirects[path]});
      else missing.push(path);
    }
    output.kinds[kind]={expected:urls.length,covered:covered.length,redirected:redirected.length,missing:missing.length,duplicates:duplicates.length,missingPaths:missing};
    output.missingCount+=missing.length;
    output.coveredCount+=covered.length;
    output.redirectedCount+=redirected.length;
  }
  return output;
}
const direct=process.argv[1] && import.meta.url===new URL('file://'+resolve(process.argv[1])).href;
if(direct){
  try{
    const result=await auditMigration();
    console.log('Existing sitemap URL coverage against newly generated HTML:');
    for(const [kind,stats] of Object.entries(result.kinds)){
      console.log(kind+': '+stats.covered+' preserved, '+stats.redirected+' redirected, '+stats.missing+' still to migrate (of '+stats.expected+')');
      if(stats.missing>0)console.log('  examples: '+stats.missingPaths.slice(0,3).join(' | '));
    }
    console.log('TOTAL: '+result.coveredCount+' preserved, '+result.redirectedCount+' redirected, '+result.missingCount+' outstanding.');
    const position=process.argv.indexOf('--json');
    if(position>=0 && process.argv[position+1]){
      const file=resolve(process.argv[position+1]);
      await mkdir(dirname(file),{recursive:true});
      await writeFile(file,JSON.stringify(result,null,2)+'\n');
    }
    if(process.argv.includes('--strict') && result.missingCount>0) {
      console.error('Migration gate FAILED: all original sitemap URLs must be preserved or explicitly redirected before launch.');
      process.exitCode=1;
    } else if(result.missingCount>0){
      console.log('Advisory mode: import in progress; this is not launch approval.');
    }
  }catch(error){console.error(error);process.exitCode=1;}
}
