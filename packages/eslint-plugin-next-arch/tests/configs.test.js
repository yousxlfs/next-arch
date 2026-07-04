import assert from 'node:assert/strict';
import plugin, { configs } from '../dist/index.js';

const recommended = configs.recommended;

assert.ok(recommended.plugins['next-arch']);
assert.equal(recommended.settings['next-arch'].srcDir, 'src');

for (const rule of [
  'next-arch/no-cross-feature-imports',
  'next-arch/no-deep-imports',
  'next-arch/no-server-in-client',
  'next-arch/no-upward-imports',
]) {
  assert.equal(recommended.rules[rule], 'error');
}

assert.equal(Object.keys(plugin.rules).length, 4);

const customSrcDir = {
  plugins: { 'next-arch': plugin },
  settings: { 'next-arch': { srcDir: 'client/src' } },
  rules: {
    'next-arch/no-upward-imports': 'error',
  },
};

assert.equal(customSrcDir.settings['next-arch'].srcDir, 'client/src');

console.log('eslint-plugin-next-arch: configs tests passed');
