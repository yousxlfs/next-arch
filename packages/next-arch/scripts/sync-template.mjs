#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '../../..');
const sourceDir = path.join(monorepoRoot, 'examples', 'next-app');
const targetDir = path.join(monorepoRoot, 'packages', 'next-arch', 'templates', 'app');

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.next',
  '.turbo',
  'dist',
  '.git',
]);

const EXCLUDED_FILES = new Set(['pnpm-lock.yaml', 'package-lock.json']);

function shouldCopy(relativePath) {
  if (!relativePath) return true;
  const parts = relativePath.split(path.sep);
  if (parts.some((part) => EXCLUDED_DIRS.has(part))) return false;
  if (EXCLUDED_FILES.has(parts[parts.length - 1])) return false;
  return true;
}

async function sync() {
  if (!(await fs.pathExists(sourceDir))) {
    throw new Error(`Example app not found: ${sourceDir}`);
  }

  await fs.ensureDir(targetDir);

  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const relative = entry.name;
    if (!shouldCopy(relative)) continue;

    const from = path.join(sourceDir, relative);
    const to = path.join(targetDir, relative);

    if (entry.isDirectory()) {
      await fs.remove(to);
      await fs.copy(from, to, {
        filter(src) {
          const rel = path.relative(sourceDir, src);
          return shouldCopy(rel);
        },
      });
      continue;
    }

    await fs.copy(from, to);
  }

  // Preserve template-specific package.json optional packages comment block
  const templatePkgPath = path.join(targetDir, 'package.json');
  const templatePkg = JSON.parse(await fs.readFile(templatePkgPath, 'utf8'));
  if (!templatePkg._comment_optionalPackages) {
    templatePkg._comment_optionalPackages = {
      zustand: '^5.0.14',
      '@tanstack/react-query': '^5.101.2',
      zod: '^4.4.3',
    };
    await fs.writeFile(templatePkgPath, `${JSON.stringify(templatePkg, null, 2)}\n`);
  }

  console.log(`Synced ${sourceDir} → ${targetDir}`);
}

sync().catch((error) => {
  console.error(error);
  process.exit(1);
});
