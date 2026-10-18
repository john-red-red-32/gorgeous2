import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCsv,inspectRows} from './inspect-bubble-exports.mjs';

test('preserves unique Bubble IDs as strings',()=>{
  const rows=parseCsv('Unique ID,Treatment,Title\n1699991111111x111,"1699992222222x222",Intro\n');
  assert.equal(rows[1][1],'1699992222222x222');
});
test('supports BOM, commas, escaped quotes and multiline rich text',()=>{
  const rows=parseCsv('\uFEFFUnique ID,Title,Body\r\n123,"A ""lovely"", result","One paragraph\r\nSecond paragraph"\r\n');
  assert.deepEqual(rows[0],['Unique ID','Title','Body']);
  assert.equal(rows[1][1],'A "lovely", result');
  assert.equal(rows[1][2],'One paragraph\r\nSecond paragraph');
});
test('flags duplicate IDs and absent IDs without altering data',()=>{
  const rows=parseCsv('Unique ID,Treatment\nabc,foo\nabc,bar\n,foo\n');
  const report=inspectRows('Treatment Section.csv',rows);
  assert.equal(report.duplicateIds,1);
  assert.equal(report.missingIds,1);
  assert.deepEqual(report.relationCandidates,['Treatment']);
});
test('rejects malformed CSV',()=>{
  assert.throws(()=>parseCsv('ID,Name\n11,"unfinished'),/Unclosed/);
});
