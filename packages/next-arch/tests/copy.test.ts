import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { copyProjectTemplate } from '../src/lib/copy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, '.tmp-copy');
const sourceDir = path.join(tmpDir, 'source');
const targetDir = path.join(tmpDir, 'target');

describe('copyProjectTemplate', () => {
  beforeEach(async () => {
    await fs.remove(tmpDir);
    await fs.ensureDir(sourceDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('copies project files to target directory', async () => {
    await fs.writeFile(path.join(sourceDir, 'package.json'), '{"name":"src-app"}\n');
    await fs.ensureDir(path.join(sourceDir, 'src'));
    await fs.writeFile(path.join(sourceDir, 'src', 'index.ts'), 'export {};\n');

    await copyProjectTemplate(sourceDir, targetDir);

    expect(await fs.pathExists(path.join(targetDir, 'package.json'))).toBe(true);
    expect(await fs.pathExists(path.join(targetDir, 'src/index.ts'))).toBe(true);
  });

  it('skips node_modules, .next, .turbo, and dist directories', async () => {
    await fs.writeFile(path.join(sourceDir, 'keep.txt'), 'yes\n');
    await fs.ensureDir(path.join(sourceDir, 'node_modules', 'pkg'));
    await fs.writeFile(path.join(sourceDir, 'node_modules', 'pkg', 'index.js'), 'skip\n');
    await fs.ensureDir(path.join(sourceDir, '.next', 'cache'));
    await fs.writeFile(path.join(sourceDir, '.next', 'cache', 'x'), 'skip\n');
    await fs.ensureDir(path.join(sourceDir, 'dist'));
    await fs.writeFile(path.join(sourceDir, 'dist', 'bundle.js'), 'skip\n');

    await copyProjectTemplate(sourceDir, targetDir);

    expect(await fs.pathExists(path.join(targetDir, 'keep.txt'))).toBe(true);
    expect(await fs.pathExists(path.join(targetDir, 'node_modules'))).toBe(false);
    expect(await fs.pathExists(path.join(targetDir, '.next'))).toBe(false);
    expect(await fs.pathExists(path.join(targetDir, 'dist'))).toBe(false);
  });
});
