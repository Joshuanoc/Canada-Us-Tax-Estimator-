import {calculate,normalizeInput} from './tax.js';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
class HttpError extends Error{constructor(status,message){super(message);this.status=status;}}
export function createHandler({fetchImpl=fetch,env=process.env}={}){
 const config=()=>{
  if(!env.SUPABASE_URL||!env.SUPABASE_PUBLISHABLE_KEY)throw new HttpError(503,'Cloud saving is not configured.');
  const url=new URL(env.SUPABASE_URL);
  if(url.protocol!=='https:')throw new HttpError(503,'Storage requires HTTPS.');
  return {base:url.origin,key:env.SUPABASE_PUBLISHABLE_KEY};
 };
 async function provider(path,{method='GET',body,token}={}){
  const c=config();const response=await fetchImpl(c.base+path,{method,headers:{apikey:c.key,...(token?{Authorization:`Bearer ${token}`}:{}) ,'Content-Type':'application/json',Prefer:'return=representation'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(10000)});
  const data=await response.json().catch(()=>null);
  if(!response.ok){if(response.status===401||response.status===403)throw new HttpError(401,'Guest session expired.');throw new HttpError(502,'Storage service could not complete the request.');}
  return data;
 }
 const cookies=req=>Object.fromEntries((req.headers.cookie||'').split(';').map(s=>s.trim().split('=')).filter(a=>a.length===2));
 function setSession(req,res,s){
  const secure=env.NODE_ENV==='production'||req.headers['x-forwarded-proto']==='https';
  const attrs=`Path=/api; HttpOnly; SameSite=Strict${secure?'; Secure':''}`;
  res.setHeader('Set-Cookie',[`taxmetric_access=${encodeURIComponent(s.access_token)}; Max-Age=${Math.min(s.expires_in||3600,3600)}; ${attrs}`,`taxmetric_refresh=${encodeURIComponent(s.refresh_token)}; Max-Age=2592000; ${attrs}`]);
 }
 async function guest(req,res,create=false){
  const stored=cookies(req);let token=stored.taxmetric_access?decodeURIComponent(stored.taxmetric_access):null;
  if(token){try{const user=await provider('/auth/v1/user',{token});return {token,user};}catch(e){if(e.status!==401)throw e;}}
  let session;
  if(stored.taxmetric_refresh){try{session=await provider('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:decodeURIComponent(stored.taxmetric_refresh)}});}catch(e){if(e.status!==401)throw e;throw new HttpError(401,'Guest session expired. Clear this site’s cookies to start a new session.');}}
  else if(create)session=await provider('/auth/v1/signup',{method:'POST',body:{data:{}}});
  else return null;
  if(!session?.access_token||!session?.refresh_token||!UUID.test(session.user?.id||''))throw new HttpError(502,'Guest session could not be established.');
  setSession(req,res,session);return {token:session.access_token,user:session.user};
 }
 async function body(req){
  if(!String(req.headers['content-type']||'').startsWith('application/json'))throw new HttpError(415,'Send application/json.');
  if(req.body!==undefined){const text=typeof req.body==='string'?req.body:JSON.stringify(req.body);if(Buffer.byteLength(text)>16384)throw new HttpError(413,'Request is too large.');try{return JSON.parse(text);}catch{throw new HttpError(400,'Invalid JSON.');}}
  let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>16384)throw new HttpError(413,'Request is too large.');}
  try{return JSON.parse(text);}catch{throw new HttpError(400,'Invalid JSON.');}
 }
 return async(req,res)=>{
  const send=(status,data)=>{res.writeHead(status);res.end(JSON.stringify(data));};
  res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  try{
   // Browser mutations must originate on this host; no permissive cross-origin credential access.
   if(!['GET','HEAD'].includes(req.method)){
    const origin=req.headers.origin;
    if(origin){const host=req.headers['x-forwarded-host']||req.headers.host;if(new URL(origin).host!==host)throw new HttpError(403,'Cross-origin requests are not permitted.');}
    if(req.headers['sec-fetch-site']==='cross-site')throw new HttpError(403,'Cross-site requests are not permitted.');
   }
   const url=new URL(req.url,'http://localhost'),path=url.pathname;
   if(path==='/api/health'&&req.method==='GET')return send(200,{status:'ok',storageConfigured:Boolean(env.SUPABASE_URL&&env.SUPABASE_PUBLISHABLE_KEY),modelVersion:'2026-v1'});
   if(path==='/api/calculate'&&req.method==='POST'){
    const input=await body(req);let result;try{result=calculate(input);}catch(e){throw new HttpError(400,e.message);}return send(200,{result});
   }
   if(path==='/api/scenarios'){
    if(req.method==='POST'){
     const raw=await body(req);let input,result;try{input=normalizeInput(raw.input);result=calculate(input);}catch(e){throw new HttpError(400,e.message);}
     if(raw.name!==undefined&&(typeof raw.name!=='string'||raw.name.length>100))throw new HttpError(400,'Scenario name must be at most 100 characters.');
     const session=await guest(req,res,true);
     const data=await provider('/rest/v1/scenarios',{method:'POST',token:session.token,body:{owner_id:session.user.id,name:raw.name||'Saved scenario',input,result}});return send(201,{scenario:data?.[0]});
    }
    if(req.method==='GET'){
     config();const session=await guest(req,res);if(!session)return send(200,{scenarios:[]});
     const data=await provider(`/rest/v1/scenarios?owner_id=eq.${session.user.id}&select=id,name,input,result,created_at&order=created_at.desc&limit=100`,{token:session.token});return send(200,{scenarios:data});
    }
    if(req.method==='DELETE'){
     const id=url.searchParams.get('id');if(!UUID.test(id||''))throw new HttpError(400,'Invalid scenario ID.');
     const session=await guest(req,res);if(!session)throw new HttpError(401,'Guest session required.');
     const data=await provider(`/rest/v1/scenarios?id=eq.${id}&owner_id=eq.${session.user.id}`,{method:'DELETE',token:session.token});if(!data?.length)throw new HttpError(404,'Scenario not found.');return send(200,{deleted:true});
    }
   }
   return send(405,{error:'Method or endpoint not supported.'});
  }catch(e){return send(e.status||502,{error:e.status?e.message:'Backend service unavailable.'});}
 };
}
export default createHandler();
