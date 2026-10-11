import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const violations=[];
for(const file of files){
 if(/(^|\/)\.env($|\.)/.test(file)&&!file.endsWith('.example'))violations.push(`${file}: private environment file tracked`);
 if(/(^|\/)(node_modules|\.vercel|playwright-report|test-results)\//.test(file))violations.push(`${file}: private or generated directory tracked`);
 const content=readFileSync(file,'utf8');
 if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content)||/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|AKIA[A-Z0-9]{16})\b/.test(content))violations.push(`${file}: credential pattern detected`);
}
if(violations.length){console.error(violations.join('\n'));process.exit(1);}
console.log(`Tracked-file security checks passed (${files.length} files). This bounded pattern scan is not a complete secret audit.`);
