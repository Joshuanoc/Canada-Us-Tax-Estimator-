import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createRateLimiter} from '../../backend/rateLimit.js';
import {createHandler} from '../../backend/http.js';
const req={headers:{'x-forwarded-for':'attacker-controlled'},socket:{remoteAddress:'127.0.0.1'}};
const env={NODE_ENV:'production',UPSTASH_REDIS_REST_URL:'https://test.upstash.io',UPSTASH_REDIS_REST_TOKEN:'test-token',RATE_LIMIT_SECRET:'a'.repeat(32)};
test('local limits expire and forged forwarded headers cannot bypass them',async()=>{
 let time=0;const limit=createRateLimiter({env:{},now:()=>time});await limit(req,'save',1,60);
 await assert.rejects(limit({...req,headers:{'x-forwarded-for':'different'}},'save',1,60),e=>e.status===429&&e.retryAfter===60);
 time=61000;await limit(req,'save',1,60);
});
test('production fails closed for absent configuration or unavailable counters',async()=>{
 await assert.rejects(createRateLimiter({env:{NODE_ENV:'production'}})(req,'save',1,60),e=>e.status===503);
 for(const fetchImpl of [async()=>{throw new Error('private connection details')},async()=>Response.json({result:[1,-1]}),async()=>Response.json({error:'private upstream error'})]){
  await assert.rejects(createRateLimiter({env,fetchImpl})(req,'save',1,60),e=>e.status===503&&!e.message.includes('private'));
 }
});
test('independent instances share counters without exposing raw IPs',async()=>{
 let count=0;const commands=[];const fetchImpl=async(url,options)=>{commands.push(JSON.parse(options.body));return Response.json({result:[++count,45]})};
 const a=createRateLimiter({env,fetchImpl}),b=createRateLimiter({env,fetchImpl});
 await a(req,'save',1,60);await assert.rejects(b(req,'save',1,60),e=>e.status===429&&e.retryAfter===45);
 assert.equal(commands[0][0],'EVAL');assert.equal(commands[0][3],commands[1][3]);assert.ok(!commands[0][3].includes('127.0.0.1'));
});
test('Vercel requires its trusted IP header',async()=>{
 const limit=createRateLimiter({env:{...env,VERCEL:'1'},fetchImpl:async()=>Response.json({result:[1,60]})});
 await assert.rejects(limit(req,'save',1,60),e=>e.status===503);
 await limit({...req,headers:{'x-vercel-forwarded-for':'203.0.113.7','x-forwarded-for':'forged'}},'save',1,60);
});
test('API rejects abuse before storage and returns Retry-After',async t=>{
 let calls=0;const s=http.createServer(createHandler({env:{},fetchImpl:async()=>{calls++;throw Error('must not run')},rateLimit:async()=>{throw Object.assign(new Error('Too many requests.'),{status:429,retryAfter:30})}}));
 await new Promise(r=>s.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>s.close(r)));
 const r=await fetch(`http://127.0.0.1:${s.address().port}/api/scenarios`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:{wages:1}})});
 assert.equal(r.status,429);assert.equal(r.headers.get('retry-after'),'30');assert.equal(calls,0);
});
