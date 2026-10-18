import test from 'node:test';
import assert from 'node:assert/strict';
import {selectDeployableRules} from './build-redirects.mjs';
test('emits server-side redirects for generated destination HTML',()=>{
 const x=selectDeployableRules({'/anti-wrinkle':'/treatments/anti-wrinkle-injections/'},['/','/treatments/anti-wrinkle-injections/']);
 assert.equal(x.active.length,2);assert.equal(x.deferred.length,0);
 assert.deepEqual(x.active.map(r=>r.status),[301,301]);
});
test('defers targets whose content has not been imported',()=>{
 const x=selectDeployableRules({'/old-gallery':'/gallery/missing/'},['/']);
 assert.equal(x.active.length,0);assert.equal(x.deferred.length,1);
});
test('never redirects an already-generated source page',()=>{
 const x=selectDeployableRules({'/treatments':'/'},['/','/treatments/']);
 assert.equal(x.active.length,0);
 assert.equal(x.invalid.length,2);
});
test('handles fragment destinations without losing target page checks',()=>{
 const x=selectDeployableRules({'/pricing':'/treatments/#price-list'},['/treatments/']);
 assert.equal(x.active[0].to,'/treatments/#price-list');
});
