import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initCommand } from '../src/commands/init.js';
import { doctorCommand } from '../src/commands/doctor.js';
import { generateCommand } from '../src/commands/generate.js';
import {
  assertNextProject,
  resolveInitOutputDir,
  resolveProjectRoot,
} from '../src/lib/project-paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, '.tmp-paths');

describe('project path helpers', () => {
  it('resolveProjectRoot uses cwd when provided', () => {
    expect(resolveProjectRoot('/tmp/my-app')).toBe(path.resolve('/tmp/my-app'));
  });

  it('resolveInitOutputDir is the parent directory for init', () => {
    expect(resolveInitOutputDir('/tmp/projects')).toBe(path.resolve('/tmp/projects'));
  });

  it('assertNextProject requires package.json and src/', () => {
    expect(() => assertNextProject('/')).toThrow(/Next Architecture project/);
  });
});

describe('init --output-dir vs project --cwd', () => {
  const parentDir = path.join(tmpDir, 'parent');
  const projectName = 'my-app';

  beforeEach(async () => {
    await fs.ensureDir(parentDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('creates project inside output-dir, not at output-dir itself', async () => {
    await initCommand(projectName, {
      outputDir: parentDir,
      yes: true,
      noExamples: true,
      projectType: 'simple',
    });

    expect(await fs.pathExists(path.join(parentDir, projectName, 'src/app/layout.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(parentDir, 'package.json'))).toBe(false);
  });

  it('doctor and generate use project root, not parent directory', async () => {
    await initCommand(projectName, {
      outputDir: parentDir,
      yes: true,
      noExamples: true,
      projectType: 'simple',
    });

    const projectRoot = path.join(parentDir, projectName);
    assertNextProject(projectRoot);

    await expect(doctorCommand(projectRoot)).resolves.toBeUndefined();
    await generateCommand('feature', 'billing', projectRoot);
    expect(await fs.pathExists(path.join(projectRoot, 'src/features/billing/index.ts'))).toBe(true);
  });
});
