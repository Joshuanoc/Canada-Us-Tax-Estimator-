import http from 'node:http';
import handler from '../backend/http.js';
import {readFile} from 'node:fs/promises';
const port=Number(process.env.PORT||5175);
const configuration=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
const headers=Object.fromEntries(configuration.headers.find(rule=>rule.source==='/(.*)').headers.map(({key,value})=>[key,value]));
const assets=['app.js','cloud.js','backend/ontario-2026.js','backend/tax-rules-2026.js','backend/calculation-contract.js','backend/tax.js','frontend/opportunities.js','frontend/eligibility.js','data/ca-2026-opportunities.json'];
const server=http.createServer(async(req,res)=>{
 for(const[key,value]of Object.entries(headers))res.setHeader(key,value);
 const path=new URL(req.url,'http://localhost').pathname;
 if(path.startsWith('/api/'))return handler(req,res);
 const file=path==='/'||path==='/index.html'?'index.html':assets.includes(path.slice(1))?path.slice(1):null;
 if(!file){res.writeHead(404);res.end('Not found');return;}
 try{
  const contents=await readFile(new URL('../'+file,import.meta.url));
  res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json; charset=utf-8':'application/javascript; charset=utf-8','Cache-Control':'no-store'});res.end(contents);
 }catch{res.writeHead(500);res.end('Application unavailable');}
});
server.listen(port,'0.0.0.0',()=>console.log(`TaxMetric development server listening on port ${port}`));
