import { mkdir, copyFile } from 'node:fs/promises';
// Publish only the application, never tests, dependencies or repository metadata.
await mkdir('dist', { recursive: true });
await copyFile('index.html', 'dist/index.html');
console.log('Static site packaged in dist/index.html');
