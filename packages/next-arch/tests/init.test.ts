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
});
