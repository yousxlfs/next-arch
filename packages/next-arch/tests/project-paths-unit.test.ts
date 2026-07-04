import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { assertNextProject, resolveInitOutputDir, resolveProjectRoot } from '../src/lib/project-paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, '.tmp-project-paths-unit');

describe('project-paths helpers', () => {
  beforeEach(async () => {
    await fs.remove(tmpDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('resolveProjectRoot resolves relative cwd', () => {
    expect(resolveProjectRoot('.')).toBe(path.resolve('.'));
    expect(resolveProjectRoot(tmpDir)).toBe(path.resolve(tmpDir));
  });

  it('resolveInitOutputDir defaults to cwd', () => {
    expect(resolveInitOutputDir()).toBe(path.resolve(process.cwd()));
  });

  it('assertNextProject passes for valid project layout', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src'));
    await fs.writeJson(path.join(tmpDir, 'package.json'), { name: 'ok' });
    expect(() => assertNextProject(tmpDir)).not.toThrow();
  });

  it('assertNextProject throws without package.json or src/', async () => {
    await fs.ensureDir(tmpDir);
    expect(() => assertNextProject(tmpDir)).toThrow(/Next Architecture project/);
  });
});
