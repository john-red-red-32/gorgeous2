#!/usr/bin/env node
/*
 * Import legacy 301 redirect rules without silently changing the destination.
 * Supports Cloudflare _redirects text, simple "from -> to" text,
 * CSV (from,to,status or source,destination,status), and JSON mappings/arrays.
 *
 * Exact duplicate mappings are removed. Conflicting sources, non-301 entries,
 * wildcard rules, external destinations and cycles are flagged for review.
 * By default prints a report; --out <file> writes a candidate JSON mapping.
 * Does not automatically activate rules on the website.
 */
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {resolve, extname, dirname} from 'node:path';
import {parseCsv} from './inspect-bubble-exports.mjs';
const DOMAIN='thegorgeousclinic.co.uk';
export function pathFrom(raw) {
  const value=String(raw??'').trim();
  if(!value)return {error:'blank route'};
  if(/[<>{}*]/.test(value))return {error:'wildcard or template rule requires manual review'};
  if(value.startsWith('//'))return {error:'protocol-relative URL requires review'};
  if(value.startsWith('http://')||value.startsWith('https://')){
    try {
      const u=new URL(value);
      if(![DOMAIN,'www.'+DOMAIN].includes(u.hostname.toLowerCase()))return{error:'other hostname: '+u.hostname};
      if(u.search||u.hash)return{error:'querystring or fragment needs review'};
      return {path:decodeURI(u.pathname)};
    }catch{return{error:'invalid absolute URL'};}
  }
  if(!value.startsWith('/'))return {error:'route must start with /'};
  if(value.includes('?')||value.includes('#'))return{error:'querystring or fragment needs review'};
  return {path:value};
}
function isHeader(parts) {
  return ['from','source','old url','old_url','from url','source url'].includes(String(parts[0]).trim().toLowerCase());
}
export function parseRedirects(text, type='txt') {
  const out=[];
  const add=(from,to,status='301',line=0) => out.push({from:String(from??'').trim(),to:String(to??'').trim(),status:String(status??'301').trim()||'301',line});
  if(type==='json') {
    const json=JSON.parse(text);
    if(Array.isArray(json))json.forEach((r,i)=>add(r.from??r.source??r.old??r.old_url,r.to??r.target??r.destination??r.new_url,r.status??r.code??301,i+1));
    else if(json && typeof json==='object')Object.entries(json).forEach(([key,val],i)=>typeof val==='string'?add(key,val,301,i+1):add(key,val?.to??val?.target,val?.status??301,i+1));
    else throw Error('Unrecognised JSON redirect data');
  } else if(type==='csv') {
    const rows=parseCsv(text);
    const header=rows[0]?.map(s=>s.trim().toLowerCase())||[];
    const sources=['from','source','old url','old_url','from url','source url'];
    const destinations=['to','target','destination','new url','new_url','redirect to'];
    const src=header.findIndex(c=>sources.includes(c)),dest=header.findIndex(c=>destinations.includes(c)),state=header.findIndex(c=>['status','code','http status'].includes(c));
    if(src>=0 && dest>=0){
      rows.slice(1).forEach((row,i)=>add(row[src],row[dest],state>=0?row[state]:301,i+2));
    }else rows.forEach((row,i)=>!isHeader(row)&&add(row[0],row[1],row[2]||301,i+1));
  } else {
    text.split(/\r?\n/).forEach((raw,i)=>{
      const line=raw.trim();
      if(!line || line.startsWith('#') || line.startsWith('//'))return;
      if(line.includes('->')) {
        const [a,b]=line.split(/\s*->\s*/,2);
        const target=b?.trim().split(/\s+/)||[];
        add(a,target[0],target[1]||301,i+1);
        return;
      }
      const parts=line.split(/\s+/).filter(Boolean);
      if(isHeader(parts))return;
      add(parts[0],parts[1],parts[2]||301,i+1);
    });
  }
  return out;
}
export function normalizeRedirects(rules) {
  const mappings={};
  const exactDuplicates=[],conflicts=[],unsupported=[],non301=[];
  for(const entry of rules) {
    const {from,to,status,line}=entry;
    const old=pathFrom(from),newPath=pathFrom(to);
    if(status!=='301') {
      non301.push({line,from,status}); continue;
    }
    if(old.error || newPath.error || old.path==='/' && newPath.path==='/') {
      unsupported.push({line,from,to,reason:old.error||newPath.error||'homepage self-redirect'});continue;
    }
    if(old.path===newPath.path) {
      unsupported.push({line,from,to,reason:'self-redirect'});continue;
    }
    if(Object.hasOwn(mappings,old.path)) {
      if(mappings[old.path]===newPath.path)exactDuplicates.push({line,from:old.path,to:newPath.path});
      else conflicts.push({line,from:old.path,original:mappings[old.path],conflicting:newPath.path});
    } else mappings[old.path]=newPath.path;
  }
  const cycles=[],chains=[];
  for(const start of Object.keys(mappings)){
    const visited=new Set([start]);
    let target=mappings[start],steps=0;
    while(mappings[target] && steps<1000){
      if(visited.has(target)){
        cycles.push({from:start,through:target});break;
      }
      visited.add(target);
      chains.push({from:start,via:target,to:mappings[target]});
      target=mappings[target];steps++;
    }
  }
  return{mappings,report:{
    incoming:rules.length,uniqueRoutes:Object.keys(mappings).length,
    removedExactDuplicates:exactDuplicates.length,exactDuplicates,
    conflicts,unsupported,non301,
    chains:chains.slice(0,150),cycles:cycles.slice(0,150)
  }};
}
const direct=process.argv[1]&&import.meta.url===new URL('file://'+resolve(process.argv[1])).href;
if(direct){
  const input=process.argv[2];
  if(!input) {console.error('Usage: node scripts/prepare-redirects.mjs <rules.txt|rules.csv|rules.json> [--out proposed.json]');process.exitCode=2;}
  else try {
    const type=extname(input).slice(1).toLowerCase()||'txt';
    const data=await readFile(resolve(input),'utf8');
    const {mappings,report}=normalizeRedirects(parseRedirects(data,type));
    console.log(JSON.stringify(report,null,2));
    const outArg=process.argv.indexOf('--out');
    if(outArg>=0&&process.argv[outArg+1]){
      if(report.conflicts.length || report.cycles.length || report.unsupported.length || report.non301.length){
        console.error('Rules need manual review. No candidate map written.');
        process.exitCode=1;
      }else{
        const target=resolve(process.argv[outArg+1]);
        await mkdir(dirname(target),{recursive:true});
        await writeFile(target,JSON.stringify(mappings,null,2)+'\n');
        console.log('Candidate map written to '+target+' (NOT activated).');
      }
    }
  }catch(error){console.error(error);process.exitCode=1;}
}
