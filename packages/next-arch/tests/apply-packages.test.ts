import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyPackageSelections } from '../src/lib/apply-packages.js';
import { DEFAULT_INIT_SELECTIONS, PACKAGE_VERSIONS } from '../src/lib/packages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, '.tmp-apply-packages');

describe('applyPackageSelections', () => {
  beforeEach(async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'app'));
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      name: 'apply-packages-test',
      dependencies: {},
      devDependencies: {
        'eslint-plugin-next-arch': '0.2.0',
      },
    });
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('merges selected dependencies into package.json', async () => {
    await applyPackageSelections(tmpDir, {
      ...DEFAULT_INIT_SELECTIONS,
      stateManager: 'zustand',
      withExamples: false,
    });

    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'));
    expect(pkg.dependencies.zustand).toBe(PACKAGE_VERSIONS.zustand);
    expect(pkg.dependencies['@tanstack/react-query']).toBe(PACKAGE_VERSIONS['@tanstack/react-query']);
    expect(pkg.devDependencies['eslint-plugin-next-arch']).toBe('0.2.0');
  });

  it('generates providers and package template files', async () => {
    const created = await applyPackageSelections(tmpDir, {
      ...DEFAULT_INIT_SELECTIONS,
      stateManager: 'none',
      optionalPackages: [],
      withExamples: false,
    });

    expect(await fs.pathExists(path.join(tmpDir, 'src/app/providers/index.tsx'))).toBe(true);
    expect(created.some((file) => file.includes('QueryProvider'))).toBe(true);
  });
});
