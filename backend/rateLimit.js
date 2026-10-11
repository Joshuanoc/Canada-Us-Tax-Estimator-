import {createHmac} from 'node:crypto';
import {isIP} from 'node:net';

// Atomic fixed-window counter shared by all instances. No request data or raw IPs stored.
const SCRIPT=`local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return {n, redis.call('TTL', KEYS[1])}`;
const error=(status,message,retryAfter)=>Object.assign(new Error(message),{status,retryAfter});
export function createRateLimiter({env=process.env,fetchImpl=fetch,now=Date.now}={}){
 const local=new Map();
 return async function limit(req,bucket,max,seconds,identity){
  const production=env.NODE_ENV==='production'||env.VERCEL==='1';
  // Trust proxy identity only on Vercel; elsewhere use the actual socket peer.
  const raw=env.VERCEL==='1'?req.headers['x-vercel-forwarded-for']:req.socket?.remoteAddress;
  const ip=typeof raw==='string'?raw.trim():'';
  if(!identity&&!isIP(ip))throw error(503,'Request protection unavailable.');
  const subject=identity||ip;
  const url=env.UPSTASH_REDIS_REST_URL,token=env.UPSTASH_REDIS_REST_TOKEN,secret=env.RATE_LIMIT_SECRET;
  let count,ttl;
  if(url&&token&&secret&&secret.length>=32){
   try{
    const endpoint=new URL(url);
    if(endpoint.protocol!=='https:'||endpoint.username||endpoint.password)throw new Error('Invalid endpoint');
    const key=`taxmetric:${env.VERCEL_ENV||env.NODE_ENV||'development'}:${bucket}:`+createHmac('sha256',secret).update(subject).digest('hex');
    const response=await fetchImpl(endpoint,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',SCRIPT,'1',key,String(seconds)]),signal:AbortSignal.timeout(3000)});
    const data=await response.json();
    if(!response.ok||data.error||!Array.isArray(data.result))throw new Error('Counter unavailable');
    [count,ttl]=data.result;
    if(!Number.isInteger(count)||count<1||!Number.isInteger(ttl)||ttl<0)throw new Error('Invalid counter');
   }catch{throw error(503,'Request protection unavailable. Please try again later.');}
  }else{
   if(production)throw error(503,'Request protection is not configured.');
   // Development only. Never use per-process counters in serverless production.
   const time=now(),key=`${bucket}:${subject}`;
   for(const[k,v]of local)if(v.until<=time)local.delete(k);
   if(!local.has(key)&&local.size>=10000)throw error(503,'Request protection unavailable.');
   const entry=local.get(key)||{count:0,until:time+seconds*1000};
   entry.count++;local.set(key,entry);count=entry.count;ttl=Math.ceil((entry.until-time)/1000);
  }
  if(count>max)throw error(429,'Too many requests. Please try again later.',Math.max(1,ttl));
 };
}
