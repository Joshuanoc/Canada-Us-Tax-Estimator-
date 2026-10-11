import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {screenOpportunity,questionsFor,filteredEntries} from '../../frontend/eligibility.js';
const catalog=JSON.parse(await readFile(new URL('../../data/ca-2026-opportunities.json',import.meta.url),'utf8'));
const context={taxYear:2026,province:'NS'};
test('catalog retains 35 distinct opportunities',()=>{assert.equal(catalog.entries.length,35);assert.equal(new Set(catalog.entries.map(e=>e.id)).size,35);});
for(const entry of catalog.entries){
 test(`${entry.id}: all conditions positive remains potential, not an approved claim`,()=>{const qs=questionsFor(entry);assert.ok(qs.length>0);const yes=Object.fromEntries(qs.map(q=>[q.id,'yes']));assert.equal(screenOpportunity(entry,yes,context).status,'potentially_eligible');});
 test(`${entry.id}: missing tax year/province or unanswered condition needs information`,()=>{const yes=Object.fromEntries(questionsFor(entry).map(q=>[q.id,'yes']));assert.equal(screenOpportunity(entry,yes,{...context,taxYear:2025}).status,'insufficient_information');assert.equal(screenOpportunity(entry,yes,{...context,province:''}).status,'insufficient_information');assert.equal(screenOpportunity(entry,{},context).status,'insufficient_information');});
 test(`${entry.id}: each negative/uncertain condition has conservative result`,()=>{const qs=questionsFor(entry),yes=Object.fromEntries(qs.map(q=>[q.id,'yes']));for(const q of qs){assert.equal(screenOpportunity(entry,{...yes,[q.id]:'no'},context).status,q.necessary?'ineligible':'insufficient_information');assert.equal(screenOpportunity(entry,{...yes,[q.id]:'no'},{...context,taxYear:2025}).status,'insufficient_information');assert.equal(screenOpportunity(entry,{...yes,[q.id]:'no'},{...context,province:'invalid'}).status,'insufficient_information');assert.equal(screenOpportunity(entry,{...yes,[q.id]:'unknown'},context).status,'insufficient_information');}});
}
test('search is case insensitive, trims whitespace and combines category',()=>{assert.ok(filteredEntries(catalog.entries,{search:' RRSP '}).some(e=>e.id==='rrsp-contributions'));assert.equal(filteredEntries(catalog.entries,{search:'RRSP',group:'family'}).length,0);assert.equal(filteredEntries(catalog.entries,{search:'<img onerror=alert(1)>'}).length,0);});
