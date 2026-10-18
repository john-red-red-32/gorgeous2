import test from 'node:test';
import assert from 'node:assert/strict';
import {parseRedirects,normalizeRedirects,pathFrom} from './prepare-redirects.mjs';
test('removes only exactly matching duplicate 301 rules',()=>{
  const rules=parseRedirects('/old/ /new/ 301\n/old/ /new/ 301\n','txt');
  const r=normalizeRedirects(rules);
  assert.deepEqual(r.mappings,{'/old/':'/new/'});
  assert.equal(r.report.removedExactDuplicates,1);
});
test('detects conflicting destinations for the same source',()=>{
  const r=normalizeRedirects(parseRedirects('/old/ /a/ 301\n/old/ /b/ 301','txt'));
  assert.equal(r.report.conflicts.length,1);
  assert.equal(r.mappings['/old/'],'/a/');
});
test('preserves legacy punctuation and Unicode paths',()=>{
  const from='/treatments/level-2-—-lip-filler-17652x123/';
  const r=normalizeRedirects([{from,to:'/treatments/lip-enhancements/',status:'301',line:1}]);
  assert.equal(r.mappings[from],'/treatments/lip-enhancements/');
});
test('recognises absolute clinic URLs but blocks external destinations',()=>{
  assert.deepEqual(pathFrom('https://thegorgeousclinic.co.uk/old/'),{path:'/old/'});
  const r=normalizeRedirects([{from:'/old/',to:'https://unknown-site.com/',status:'301',line:1}]);
  assert.equal(r.report.unsupported.length,1);
});
test('supports redirects CSV with headings',()=>{
  const r=normalizeRedirects(parseRedirects('from,to,status\n/abc/,/def/,301\n/xyz/,/tgt/,301\n','csv'));
  assert.equal(r.report.uniqueRoutes,2);
});
test('detects redirect cycles and chains for review',()=>{
  const r=normalizeRedirects(parseRedirects('/a/ /b/ 301\n/b/ /a/ 301','txt'));
  assert.ok(r.report.cycles.length>0);
});
test('ignores lines marked as comments',()=>{
  assert.equal(parseRedirects('# old redirects\n/a/ /b/ 301\n','txt').length,1);
});
