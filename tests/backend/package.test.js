import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync, existsSync} from 'node:fs';
import {resolve, dirname, relative} from 'node:path';

test('static package contains every local module dependency and no server secrets', () => {
  execFileSync(process.execPath, ['scripts/build.mjs']);
  const root = resolve('dist');
  const seen = new Set();
  function inspect(file) {
    assert.ok(existsSync(file), `Missing packaged module: ${relative(root, file)}`);
    assert.ok(file.startsWith(root + '/'), 'Packaged dependencies must remain inside dist');
    if (seen.has(file)) return;
    seen.add(file);
    const source = readFileSync(file, 'utf8');
    const imports = [...source.matchAll(/(?:from\s*|import\s*\(?\s*)['"]([^'"]+)['"]/g)];
    if (file.endsWith('.html')) imports.push(...source.matchAll(/src=['"]([^'"]+\.js)['"]/g));
    for (const [, specifier] of imports) {
      if (!specifier.startsWith('http') && (specifier.startsWith('.') || !specifier.includes(':'))) {
        inspect(resolve(dirname(file), specifier));
      }
    }
  }
  inspect(resolve(root, 'index.html'));
  assert.ok(seen.has(resolve(root, 'backend/tax.js')), 'Browser must use the canonical calculation engine');
  assert.ok(existsSync(resolve(root, 'data/ca-2026-opportunities.json')));
  for (const path of ['backend/http.js', '.env', 'database/001_scenarios.sql', 'tests/backend/api.test.js']) {
    assert.equal(existsSync(resolve(root, path)), false, `Unexpected published file: ${path}`);
  }
});
