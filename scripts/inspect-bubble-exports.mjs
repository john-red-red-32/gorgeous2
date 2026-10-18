#!/usr/bin/env node
/* Bubble export inspector: reads CSVs without publishing record values. */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join, dirname, extname } from 'node:path';

export function parseCsv(input) {
  const source=String(input).replace(/^\uFEFF/,'');
  const rows=[];
  let row=[],cell='',quoted=false;
  for(let i=0;i<source.length;i++) {
    const c=source[i];
    if(quoted) {
      if(c==='"') {
        if(source[i+1]==='"'){cell+='"';i++;}
        else quoted=false;
      } else cell+=c;
    } else if(c==='"' && cell.length===0) quoted=true;
    else if(c===','){row.push(cell);cell='';}
    else if(c==='\r'||c==='\n'){
      if(c==='\r' && source[i+1]==='\n') i++;
      row.push(cell);cell='';
      if(row.some(v=>v.trim()!==''))rows.push(row);
      row=[];
    } else cell+=c;
  }
  if(quoted)throw new Error('Unclosed quoted CSV cell');
  row.push(cell);
  if(row.some(v=>v.trim()!==''))rows.push(row);
  return rows;
}
export function inspectRows(name,rows) {
  const [headers=[],...records]=rows;
  const idHeader=headers.find(h=>/^(unique id|unique_id|bubble id|_id|id)$/i.test(h.trim()))||null;
  const index=idHeader===null?-1:headers.indexOf(idHeader);
  const seen=new Set();let duplicates=0,missing=0;
  if(index>=0)for(const record of records){
    const id=(record[index]||'').trim();
    if(!id)missing++;
    else if(seen.has(id))duplicates++;
    else seen.add(id);
  }
  return {
    file:name,rows:records.length,columns:headers.length,headers,
    idColumn:idHeader,distinctIds:seen.size,duplicateIds:duplicates,
    missingIds:index<0?null:missing,
    malformedWidths:records.filter(r=>r.length!==headers.length).length,
    relationCandidates:headers.filter(h=>/treatment|parent|section|concern|gallery|article|blog|video|price|related|linked/i.test(h))
  };
}
export async function inspectFolder(folder) {
  const files=(await readdir(folder)).filter(name=>extname(name).toLowerCase()==='.csv').sort();
  if(!files.length)throw new Error('No CSV files in '+folder);
  const result=[];
  for(const file of files){
    const data=await readFile(join(folder,file),'utf8');
    result.push(inspectRows(file,parseCsv(data)));
  }
  return result;
}
const direct=process.argv[1] && import.meta.url===new URL('file://'+resolve(process.argv[1])).href;
if(direct){
  const folder=process.argv[2];
  if(!folder) {
    console.error('Usage: node scripts/inspect-bubble-exports.mjs <folder> [--out filename.json]');
    process.exitCode=2;
  } else try {
    const summary=await inspectFolder(resolve(folder));
    const i=process.argv.indexOf('--out');
    if(i>=0 && process.argv[i+1]) {
      const target=resolve(process.argv[i+1]);
      await mkdir(dirname(target),{recursive:true});
      await writeFile(target,JSON.stringify(summary,null,2)+'\n');
    }
    for(const x of summary) {
      console.log('\n'+x.file+': '+x.rows+' rows');
      console.log('  headers: '+x.headers.join(' | '));
      console.log('  unique ID: '+(x.idColumn||'not detected'));
      console.log('  relationship candidates: '+x.relationCandidates.join(' | '));
      if(x.duplicateIds||x.missingIds||x.malformedWidths)console.warn('  ⚠ duplicates='+x.duplicateIds+' missing IDs='+x.missingIds+' malformed='+x.malformedWidths);
    }
    console.log('\nInspection completed; no records published or migrated.');
  } catch(error) {console.error(error);process.exitCode=1;}
}
