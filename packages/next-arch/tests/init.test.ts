import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initCommand } from '../src/commands/init.js';
import { resolveTemplatesDir } from '../src/lib/paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseDir = path.join(__dirname, '.tmp-init');

describe('init -y merge', () => {
  const projectName = 'existing-app';

  beforeEach(async () => {
    await fs.ensureDir(path.join(baseDir, projectName));
    await fs.writeFile(path.join(baseDir, projectName, 'old-file.txt'), 'keep-me');
  });

  afterEach(async () => {
    await fs.remove(baseDir);
  });

  it('merges into existing directory without prompting when -y', async () => {
    await initCommand(projectName, {
      outputDir: baseDir,
      yes: true,
      noExamples: true,
      projectType: 'simple',
    });

    const projectDir = path.join(baseDir, projectName);
    expect(await fs.pathExists(path.join(projectDir, 'old-file.txt'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/app/layout.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'AGENTS.md'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'CLAUDE.md'))).toBe(false);
  });
});

describe('slice templates', () => {
  it('feature template does not include AGENTS.md', async () => {
    const featureTemplate = path.join(resolveTemplatesDir(), 'feature');
    expect(await fs.pathExists(path.join(featureTemplate, 'AGENTS.md'))).toBe(false);
  });

  for (const slice of ['view', 'widget', 'entity'] as const) {
    it(`${slice} template does not include AGENTS.md`, async () => {
      const templateDir = path.join(resolveTemplatesDir(), slice);
      expect(await fs.pathExists(path.join(templateDir, 'AGENTS.md'))).toBe(false);
    });
  }

  it('app template includes root AGENTS.md', async () => {
    const appTemplate = path.join(resolveTemplatesDir(), 'app');
    expect(await fs.pathExists(path.join(appTemplate, 'AGENTS.md'))).toBe(true);
  });

  it('full project type keeps entities and widgets layers', async () => {
    const parentDir = path.join(baseDir, 'full-type');
    await fs.ensureDir(parentDir);

    await initCommand('full-app', {
      outputDir: parentDir,
      yes: true,
      noExamples: true,
      projectType: 'full',
    });

    const projectDir = path.join(parentDir, 'full-app');
    expect(await fs.pathExists(path.join(projectDir, 'src/entities/user/index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/widgets/site-header/index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/views/HomeView/index.tsx'))).toBe(true);
  });

  it('standard project type removes views and widgets but keeps entities', async () => {
    const parentDir = path.join(baseDir, 'standard-type');
    await fs.ensureDir(parentDir);

    await initCommand('standard-app', {
      outputDir: parentDir,
      yes: true,
      noExamples: true,
      projectType: 'standard',
    });

    const projectDir = path.join(parentDir, 'standard-app');
    expect(await fs.pathExists(path.join(projectDir, 'src/views'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/widgets'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/entities/user/index.ts'))).toBe(true);
  });

  it('simple project type removes entities, views, and widgets', async () => {
    const parentDir = path.join(baseDir, 'simple-type');
    await fs.ensureDir(parentDir);

    await initCommand('simple-app', {
      outputDir: parentDir,
      yes: true,
      noExamples: true,
      projectType: 'simple',
    });

    const projectDir = path.join(parentDir, 'simple-app');
    expect(await fs.pathExists(path.join(projectDir, 'src/views'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/widgets'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/entities'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/features/demo/index.ts'))).toBe(true);
  });
});
