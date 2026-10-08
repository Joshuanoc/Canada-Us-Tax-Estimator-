import { mkdir, copyFile } from 'node:fs/promises';
// Publish only the application, never tests, dependencies or repository metadata.
await mkdir('dist', { recursive: true });
await copyFile('index.html', 'dist/index.html');
await copyFile('cloud.js', 'dist/cloud.js');
console.log('Frontend packaged in dist; Vercel discovers api functions separately.');
