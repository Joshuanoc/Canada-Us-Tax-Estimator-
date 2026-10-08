import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import{PGlite}from '@electric-sql/pglite';
test('PostgreSQL row policies isolate guest scenarios and deny anonymous access',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;`);
 const sql=await fs.readFile(new URL('../../database/001_scenarios.sql',import.meta.url),'utf8');await db.exec(sql);await db.exec(sql);
 const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';
 await db.query('insert into auth.users(id) values ($1),($2)',[a,b]);await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[a]);
 await db.query("insert into public.scenarios(owner_id,name,input,result) values ($1,'A','{}','{}')",[a]);
 assert.equal((await db.query('select * from public.scenarios')).rows.length,1);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[b]);assert.equal((await db.query('select * from public.scenarios')).rows.length,0);
 await assert.rejects(db.query("insert into public.scenarios(owner_id,name,input,result) values ($1,'Forged','{}','{}')",[a]),/row-level security/);
 await db.exec('delete from public.scenarios');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[a]);assert.equal((await db.query('select * from public.scenarios')).rows.length,1);
 await db.exec('reset role;set role anon');await assert.rejects(db.query('select * from public.scenarios'),/permission denied/);
 }finally{await db.close();}
});
