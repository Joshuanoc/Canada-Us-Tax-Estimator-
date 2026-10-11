import { mkdir, copyFile } from 'node:fs/promises';
// Publish only the application, never tests, dependencies or repository metadata.
await mkdir('dist', { recursive: true });
await copyFile('index.html', 'dist/index.html');
await copyFile('cloud.js', 'dist/cloud.js');
await copyFile('app.js', 'dist/app.js');
console.log('Frontend packaged in dist; Vercel discovers api functions separately.');

for(const file of ['backend/ontario-2026.js','backend/tax.js','backend/tax-rules-2026.js','backend/calculation-contract.js','frontend/opportunities.js','frontend/eligibility.js','data/ca-2026-opportunities.json']){await mkdir('dist/'+file.slice(0,file.lastIndexOf('/')),{recursive:true});await copyFile(file,'dist/'+file);}
