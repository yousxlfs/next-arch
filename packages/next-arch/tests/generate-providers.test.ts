import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generateProviders } from '../src/lib/generate-providers.js';
import { DEFAULT_INIT_SELECTIONS } from '../src/lib/packages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, '.tmp-generate-providers');

describe('generateProviders', () => {
  beforeEach(async () => {
    await fs.remove(tmpDir);
    await fs.ensureDir(path.join(tmpDir, 'src', 'app'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('generates QueryProvider-only wrapper for zustand default', async () => {
    const providersPath = await generateProviders(tmpDir, {
      ...DEFAULT_INIT_SELECTIONS,
      stateManager: 'zustand',
      optionalPackages: [],
    });

    const content = await fs.readFile(providersPath, 'utf8');
    expect(content).toContain('QueryProvider');
    expect(content).not.toContain('ReduxProvider');
    expect(content).not.toContain('JotaiProvider');
    expect(content).not.toContain('SonnerToaster');
  });

  it('wraps ReduxProvider when redux selected', async () => {
    await generateProviders(tmpDir, {
      ...DEFAULT_INIT_SELECTIONS,
      stateManager: 'redux',
      optionalPackages: [],
    });

    const content = await fs.readFile(
      path.join(tmpDir, 'src/app/providers/index.tsx'),
      'utf8',
    );
    expect(content).toContain('ReduxProvider');
    expect(content).toMatch(/<ReduxProvider>\s*\n\s*{children}/);
  });

  it('wraps JotaiProvider when jotai selected', async () => {
    await generateProviders(tmpDir, {
      ...DEFAULT_INIT_SELECTIONS,
      stateManager: 'jotai',
      optionalPackages: [],
    });

    const content = await fs.readFile(
      path.join(tmpDir, 'src/app/providers/index.tsx'),
      'utf8',
    );
    expect(content).toContain('JotaiProvider');
  });

  it('adds SonnerToaster sibling when sonner selected', async () => {
    await generateProviders(tmpDir, {
      ...DEFAULT_INIT_SELECTIONS,
      stateManager: 'none',
      optionalPackages: ['sonner'],
    });

    const content = await fs.readFile(
      path.join(tmpDir, 'src/app/providers/index.tsx'),
      'utf8',
    );
    expect(content).toContain('SonnerToaster');
    expect(content).toContain('<SonnerToaster />');
  });

  it('nests redux outside sonner inside QueryProvider', async () => {
    await generateProviders(tmpDir, {
      ...DEFAULT_INIT_SELECTIONS,
      stateManager: 'redux',
      optionalPackages: ['sonner'],
    });

    const content = await fs.readFile(
      path.join(tmpDir, 'src/app/providers/index.tsx'),
      'utf8',
    );
    expect(content.indexOf('ReduxProvider')).toBeLessThan(content.indexOf('SonnerToaster'));
    expect(content.indexOf('QueryProvider')).toBeLessThan(content.indexOf('ReduxProvider'));
  });
});
