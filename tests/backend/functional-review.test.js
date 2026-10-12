import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate} from '../../backend/tax.js';
test('corporate marginal income tax follows the supported flat rate',()=>{
 assert.equal(calculate({mode:'business',businessType:'c_corp',grossReceipts:60000}).marginal,21);
 assert.equal(calculate({country:'ca',mode:'business',businessType:'corp_general',grossReceipts:60000}).marginal,15);
 assert.equal(calculate({mode:'business',businessType:'c_corp',grossReceipts:100,advertising:200}).marginal,0);
});
test('US employment payroll stays unknown and SE exclusions are explicit',()=>{
 assert.equal(calculate({wages:60000}).components.payrollContributions,null);
 assert.ok(calculate({selfEmployment:60000}).limitations.some(x=>x.includes('QBI')));
});
