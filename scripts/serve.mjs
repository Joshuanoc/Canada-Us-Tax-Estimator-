import http from 'node:http';
import handler from '../backend/http.js';
import {readFile} from 'node:fs/promises';
const port=Number(process.env.PORT||5175);
const server=http.createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 if(path.startsWith('/api/'))return handler(req,res);
 const assets={'/backend/ontario-2026.js':'../backend/ontario-2026.js','/backend/tax-rules-2026.js':'../backend/tax-rules-2026.js','/backend/calculation-contract.js':'../backend/calculation-contract.js','/backend/tax.js':'../backend/tax.js','/frontend/opportunities.js':'../frontend/opportunities.js','/frontend/eligibility.js':'../frontend/eligibility.js','/data/ca-2026-opportunities.json':'../data/ca-2026-opportunities.json'};
 if(assets[path]){try{res.writeHead(200,{'Content-Type':path.endsWith('.json')?'application/json; charset=utf-8':'application/javascript; charset=utf-8','X-Content-Type-Options':'nosniff'});res.end(await readFile(new URL(assets[path],import.meta.url)));}catch{res.end();}return;}
 if(path==='/cloud.js'){res.writeHead(200,{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store'});res.end(await readFile(new URL('../cloud.js',import.meta.url)));return;}
 if(path!=='/'&&path!=='/index.html'){res.writeHead(404);res.end('Not found');return;}
 try{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(await readFile(new URL('../index.html',import.meta.url)));}
 catch{res.writeHead(500);res.end('Application unavailable');}
});
server.listen(port,'0.0.0.0',()=>console.log(`TaxMetric development server listening on port ${port}`));
