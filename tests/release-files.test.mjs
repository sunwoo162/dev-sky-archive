import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

async function read(relativePath) {
  return fs.readFile(path.join(root, relativePath), 'utf8');
}

test('release workflow files document safe contribution rules', async () => {
  const gitignore = await read('.gitignore');
  const contributing = await read('CONTRIBUTING.md');
  const pullRequestTemplate = await read('.github/pull_request_template.md');

  assert.match(gitignore, /^\.superpowers\/$/m);
  assert.match(gitignore, /^node_modules\/$/m);
  assert.match(contributing, /Conventional Commits/i);
  assert.match(contributing, /node --test tests\/\*\.mjs/);
  assert.match(contributing, /needs-confirmation/);
  assert.match(pullRequestTemplate, /## Browser QA/);
  assert.match(pullRequestTemplate, /## Data \/ role confirmation/);
});

test('readme points contributors to the archive index and release checks', async () => {
  const readme = await read('README.md');

  assert.match(readme, /Archive Index/i);
  assert.match(readme, /node --test tests\/\*\.mjs/);
  assert.match(readme, /CONTRIBUTING\.md/);
});
