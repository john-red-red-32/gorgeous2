#!/usr/bin/env node
/**
 * Deterministic audit of historical 301 rules imported from Bubble.
 * All entries are advisory. This script never writes live redirect rules.
 *
 * The legacy export was a concatenation of absolute URL pairs; its exact
 * 858 distinct pairs are stored as relative source/destination strings.
 * Blank destination means the root of thegorgeousclinic.co.uk.
 */
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

export function auditPairs(pairs) {
  const exact=new Map(),groups=new Map(),invalid=[],individualConflicts=[];
  for(const [index,item] of pairs.entries()){
    const from=String(item.from??''),to=String(item.to??'')||'/';
    const pairKey=JSON.stringify([from,to]);
    if(exact.has(pairKey))throw new Error('Duplicate pair in deduplicated archive: '+from);
    exact.set(pairKey,index);
    if(!from.startsWith('/')||!to.startsWith('/')) {
      invalid.push({index,from,to});continue;
    }
    const sourcePath=from.split('?')[0];
    if(!groups.has(sourcePath))groups.set(sourcePath,[]);
    groups.get(sourcePath).push({from,to});
  }
  const distinctOriginals=new Map();
  for(const {from,to} of pairs){
    const targets=distinctOriginals.get(from)||new Set();
    targets.add(to);
    distinctOriginals.set(from,targets);
  }
  for(const [from,targets] of distinctOriginals)if(targets.size>1)individualConflicts.push({from,targets:[...targets]});
  const pathConflicts=[],clearMap={},queryBasedPaths=[];
  for(const [path,entries] of groups){
    const targets=[...new Set(entries.map(e=>e.to))];
    if(targets.length>1) pathConflicts.push({path,targets,variants:entries.length});
    else clearMap[path]=targets[0];
    if(entries.some(x=>x.from.includes('?')))queryBasedPaths.push(path);
  }
  return {
    rawPairs:pairs.length,uniqueExactSources:distinctOriginals.size,
    sourcePaths:groups.size,clearCandidates:Object.keys(clearMap).length,
    pathConflicts:pathConflicts.length,exactSourceConflicts:individualConflicts.length,
    queryVariantEntries:pairs.filter(x=>x.from.includes('?')).length,
    querySourcePaths:queryBasedPaths.length,invalid:invalid.length,
    examples:pathConflicts.slice(0,8),
    note:'Imported redirect proposals are never activated without manual review and confirmation that target pages exist.'
  };
}
if(process.argv[1] && fileURLToPath(import.meta.url)===process.argv[1]){
  const raw=JSON.parse(await readFile('migration/source/legacy-301-pairs.json','utf8'));
  const r=auditPairs(raw.pairs);
  console.log(JSON.stringify(r,null,2));
  if(r.invalid>0 || r.pathConflicts<1) process.exitCode=1;
}
