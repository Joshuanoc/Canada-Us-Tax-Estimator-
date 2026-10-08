import http from 'node:http';
import {readFile} from 'node:fs/promises';
const port=Number(process.env.PORT||5174);
const server=http.createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 if(path!=='/'&&path!=='/index.html'){res.writeHead(404);res.end('Not found');return;}
 try{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(await readFile(new URL('../index.html',import.meta.url)));}
 catch{res.writeHead(500);res.end('Application unavailable');}
});
server.listen(port,'0.0.0.0',()=>console.log(`TaxMetric development server listening on port ${port}`));
