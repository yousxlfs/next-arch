import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { ESLint } from 'eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const exampleAppDir = path.join(repoRoot, 'examples/next-app');
const exampleAppSrc = path.join(exampleAppDir, 'src');

const NEXT_ARCH_RULES = new Set([
  'next-arch/no-cross-feature-imports',
  'next-arch/no-deep-imports',
  'next-arch/no-server-in-client',
  'next-arch/no-upward-imports',
]);

function isErrorSeverity(value) {
  if (value === 'error' || value === 2) return true;
  if (Array.isArray(value) && (value[0] === 'error' || value[0] === 2)) return true;
  return false;
}

test('examples/next-app exists in monorepo', () => {
  assert.equal(fs.existsSync(exampleAppSrc), true, 'examples/next-app/src is required for integration tests');
});

test('examples/next-app has zero next-arch ESLint violations', async () => {
  assert.equal(fs.existsSync(path.join(exampleAppDir, 'eslint.config.mjs')), true);

  const eslint = new ESLint({ cwd: exampleAppDir });
  const results = await eslint.lintFiles(['src/**/*.ts', 'src/**/*.tsx']);

  const violations = [];
  for (const result of results) {
    for (const message of result.messages) {
      if (message.ruleId && NEXT_ARCH_RULES.has(message.ruleId)) {
        violations.push({
          file: path.relative(exampleAppDir, result.filePath),
          rule: message.ruleId,
          line: message.line,
          message: message.message,
        });
      }
    }
  }

  assert.equal(
    violations.length,
    0,
    `Example app must stay architecture-clean:\n${violations
      .map((v) => `  ${v.file}:${v.line} [${v.rule}] ${v.message}`)
      .join('\n')}`,
  );
});

test('examples/next-app loads eslint.config.mjs with next-arch rules enabled', async () => {
  const eslint = new ESLint({ cwd: exampleAppDir });
  const configs = await eslint.calculateConfigForFile(
    path.join(exampleAppDir, 'src/app/page.tsx'),
  );

  for (const rule of NEXT_ARCH_RULES) {
    assert.equal(
      isErrorSeverity(configs.rules?.[rule]),
      true,
      `${rule} should be error in example app config`,
    );
  }
});
