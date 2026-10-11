import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';
import{createHandler}from '../../backend/http.js';import{calculate}from '../../backend/tax.js';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',ID='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
async function server(t,options={}){const s=http.createServer(createHandler({rateLimit:async()=>{},...options}));await new Promise(r=>s.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>s.close(r)));return `http://127.0.0.1:${s.address().port}`;}
const env={TAXMETRIC_CLOUD_STORAGE_ENABLED:'true',SUPABASE_URL:'https://example.supabase.co',SUPABASE_PUBLISHABLE_KEY:'test-public-key',NODE_ENV:'production'};
function provider(){const rows=[];const calls=[];return{calls,rows,fetchImpl:async(url,opts)=>{
 calls.push({url,opts});const path=new URL(url);const token=opts.headers.Authorization?.replace('Bearer ','');const owner=token==='access-b'?B:A;
 if(path.pathname==='/auth/v1/signup')return Response.json({access_token:'access-a',refresh_token:'refresh-a',expires_in:3600,user:{id:A}});
 if(path.pathname==='/auth/v1/user')return token?.startsWith('access-')?Response.json({id:owner}):Response.json({}, {status:401});
 if(path.pathname==='/auth/v1/token')return Response.json({access_token:'access-a',refresh_token:'refresh-a2',expires_in:3600,user:{id:A}});
 if(path.pathname==='/rest/v1/scenarios'){
  if(opts.method==='POST'){const body=JSON.parse(opts.body);if(body.owner_id!==owner)return Response.json({}, {status:403});const row={...body,id:ID,created_at:new Date().toISOString()};rows.push(row);return Response.json([row]);}
  const found=rows.filter(r=>r.owner_id===owner&&(!path.searchParams.has('id')||path.searchParams.get('id')===`eq.${r.id}`));
  if(opts.method==='DELETE')found.forEach(r=>rows.splice(rows.indexOf(r),1));return Response.json(found);
 }
 return Response.json({}, {status:404});
}};}
const post=(url,body,headers={})=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
test('calculation API validates inputs and computes server-side results',async t=>{
 const url=await server(t,{env:{}});let r=await post(url+'/api/calculate',{wages:100000});assert.equal(r.status,200);assert.equal((await r.json()).result.estimated,13170);
 for(const input of [{wages:-1},{wages:'100000'},{country:'other'},{dividends:100},{wages:1e12},{standardDeduction:'false'},{subRegion:'QC',country:'ca'},{country:'ca',selfEmployment:1},{country:'ca',rrspContrib:100},{retirementContrib:1},{hsaContrib:1},{charitableDonations:1},{selfEmployment:220000}]){r=await post(url+'/api/calculate',input);assert.equal(r.status,400);}
 r=await post(url+'/api/calculate',{wages:100000},{Origin:'https://unrelated.example'});assert.equal(r.status,403);
});
test('anonymous save sets HttpOnly secure cookies and recomputes untrusted result',async t=>{
 const p=provider(),url=await server(t,{env,fetchImpl:p.fetchImpl});const r=await post(url+'/api/scenarios',{input:{wages:100000},result:{estimated:0},owner_id:B});assert.equal(r.status,201);
 assert.equal((await r.json()).scenario.result.estimated,13170);assert.equal(p.rows[0].owner_id,A);
 for(const cookie of r.headers.getSetCookie()){assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);assert.match(cookie,/SameSite=Strict/);}
});
test('guest sessions can list and delete only their own scenarios',async t=>{
 const p=provider(),url=await server(t,{env,fetchImpl:p.fetchImpl});await post(url+'/api/scenarios',{input:{wages:100000}});
 let r=await fetch(url+'/api/scenarios',{headers:{Cookie:'taxmetric_access=access-b'}});assert.deepEqual((await r.json()).scenarios,[]);
 r=await fetch(url+`/api/scenarios?id=${ID}`,{method:'DELETE',headers:{Cookie:'taxmetric_access=access-b'}});assert.equal(r.status,404);assert.equal(p.rows.length,1);
 r=await fetch(url+`/api/scenarios?id=${ID}`,{method:'DELETE',headers:{Cookie:'taxmetric_access=access-a'}});assert.equal(r.status,200);assert.equal(p.rows.length,0);
 assert.ok(p.calls.filter(c=>c.url.includes('/rest/')).every(c=>c.opts.method==='POST'||c.url.includes('owner_id=eq.')));
});
test('missing storage fails explicitly and expired access tokens can refresh',async t=>{
 const url=await server(t,{env:{}});const r=await post(url+'/api/scenarios',{input:{wages:1}});assert.equal(r.status,503);
 const p=provider(),ready=await server(t,{env,fetchImpl:p.fetchImpl});const refreshed=await fetch(ready+'/api/scenarios',{headers:{Cookie:'taxmetric_access=expired; taxmetric_refresh=refresh-a'}});assert.equal(refreshed.status,200);assert.equal(refreshed.headers.getSetCookie().length,2);
});
test('Canadian verified payroll adjustments and corporate baseline computations',()=>{
 const r=calculate({country:'ca',subRegion:'ON',wages:100000});assert.equal(r.federal,13301.60);assert.equal(r.regionTax,6722.75);
 assert.equal(calculate({mode:'business',businessType:'c_corp',grossReceipts:100000,advertising:10000}).estimated,18900);
 assert.throws(()=>calculate({mode:'business',grossReceipts:100,returnsAllowances:101}),/cannot exceed/);
});
test('malformed JSON shapes, oversized payloads and session cookies are rejected explicitly',async t=>{
 const url=await server(t,{env});
 assert.equal((await post(url+'/api/scenarios',null)).status,400);
 assert.equal((await post(url+'/api/scenarios',[])).status,400);
 assert.equal((await post(url+'/api/calculate',{padding:'x'.repeat(17000)})).status,413);
 assert.equal((await fetch(url+'/api/scenarios',{headers:{Cookie:'taxmetric_access=%ZZ'}})).status,400);
 assert.equal((await post(url+'/api/calculate',{}, {Origin:'null'})).status,403);
 assert.equal((await post(url+'/api/calculate',{}, {'Sec-Fetch-Site':'cross-site'})).status,403);
});

test('health leaves free browser mode available when production protection is unconfigured',async t=>{
 const url=await server(t,{env});const health=await (await fetch(url+'/api/health')).json();
 assert.equal(health.calculationApiAvailable,false);assert.equal(health.storageConfigured,false);
 const local=await server(t,{env:{}});assert.equal((await (await fetch(local+'/api/health')).json()).calculationApiAvailable,true);
 const configured=await server(t,{env:{...env,UPSTASH_REDIS_REST_URL:'https://test.upstash.io',UPSTASH_REDIS_REST_TOKEN:'test-token',RATE_LIMIT_SECRET:'a'.repeat(32)}});
 assert.equal((await (await fetch(configured+'/api/health')).json()).calculationApiAvailable,true);
});

test('cloud persistence is opt-in and never contacts storage when disabled',async t=>{
 let calls=0;const url=await server(t,{env:{...env,TAXMETRIC_CLOUD_STORAGE_ENABLED:'false'},fetchImpl:async()=>{calls++;throw new Error('must not contact storage');}});
 const health=await (await fetch(url+'/api/health')).json();assert.equal(health.storageConfigured,false);
 for(const method of ['GET','POST','DELETE']){const r=await fetch(url+'/api/scenarios',{method,...(method==='POST'?{headers:{'Content-Type':'application/json'},body:'{}'}:{})});assert.equal(r.status,503);}
 assert.equal(calls,0);
});
