import fs from 'fs-extra';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveTemplatesDir } from '../src/lib/paths.js';

describe('template structure', () => {
  const templatesDir = resolveTemplatesDir();

  it('feature template has FSD subfolders and public index', async () => {
    const featureDir = path.join(templatesDir, 'feature');
    for (const dir of ['ui', 'model', 'api', 'actions', 'lib', 'queries', 'types']) {
      expect(await fs.pathExists(path.join(featureDir, dir))).toBe(true);
    }
    expect(await fs.pathExists(path.join(featureDir, 'index.ts'))).toBe(true);
  });

  it('entity template has model and ui', async () => {
    const entityDir = path.join(templatesDir, 'entity');
    expect(await fs.pathExists(path.join(entityDir, 'index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(entityDir, 'model'))).toBe(true);
    expect(await fs.pathExists(path.join(entityDir, 'ui'))).toBe(true);
  });

  it('widget template has ui and index', async () => {
    const widgetDir = path.join(templatesDir, 'widget');
    expect(await fs.pathExists(path.join(widgetDir, 'index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(widgetDir, 'ui'))).toBe(true);
  });

  it('view template has index entry', async () => {
    expect(await fs.pathExists(path.join(templatesDir, 'view', 'index.tsx'))).toBe(true);
  });

  it.each(['auth', 'blank', 'crud', 'dashboard', 'profile', 'settings'] as const)(
    'page preset %s exists',
    async (preset) => {
      expect(await fs.pathExists(path.join(templatesDir, 'pages', preset))).toBe(true);
    },
  );

  it('package templates include core query and env', async () => {
    const packagesDir = path.join(templatesDir, 'packages');
    expect(await fs.pathExists(path.join(packagesDir, 'tanstack-query', 'core'))).toBe(true);
    expect(await fs.pathExists(path.join(packagesDir, 'env', 'core'))).toBe(true);
  });
});
