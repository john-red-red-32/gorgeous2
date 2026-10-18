import test from 'node:test';
import assert from 'node:assert/strict';
import {auditPairs} from './audit-legacy-redirects.mjs';
test('keeps distinct query variants while reporting shared path collisions',()=>{
  const r=auditPairs([{from:'/old?ref=a',to:'/new-a'},{from:'/old?ref=b',to:'/new-b'},{from:'/other',to:'/new'}]);
  assert.equal(r.rawPairs,3);assert.equal(r.sourcePaths,2);assert.equal(r.pathConflicts,1);assert.equal(r.queryVariantEntries,2);
});
test('treats blank absolute-homepage suffix as root destination',()=>{
  const r=auditPairs([{from:'/our-team',to:''}]);
  assert.equal(r.pathConflicts,0);assert.equal(r.invalid,0);
});
test('identifies exact-source conflicts without selecting an arbitrary target',()=>{
  const r=auditPairs([{from:'/x',to:'/a'},{from:'/x',to:'/b'}]);
  assert.equal(r.exactSourceConflicts,1);assert.equal(r.pathConflicts,1);
});
test('rejects an accidental exact duplicate in the archive',()=>{
  assert.throws(()=>auditPairs([{from:'/a',to:'/b'},{from:'/a',to:'/b'}]),/Duplicate pair/);
});
