import fs from 'fs-extra';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  getPackageRoot,
  resolveAppTemplateDir,
  resolveTemplatesDir,
} from '../src/lib/paths.js';

describe('paths helpers', () => {
  it('getPackageRoot points to next-arch package with package.json', () => {
    const root = getPackageRoot();
    expect(fs.existsSync(path.join(root, 'package.json'))).toBe(true);

    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as {
      name?: string;
    };
    expect(pkg.name).toBe('@yousxlfs/next-arch');
  });

  it('resolveTemplatesDir returns existing templates folder', () => {
    const templatesDir = resolveTemplatesDir();
    expect(fs.existsSync(templatesDir)).toBe(true);
    expect(fs.existsSync(path.join(templatesDir, 'feature'))).toBe(true);
    expect(fs.existsSync(path.join(templatesDir, 'app'))).toBe(true);
  });

  it('resolveAppTemplateDir returns app scaffold with package.json', () => {
    const appDir = resolveAppTemplateDir();
    expect(fs.existsSync(path.join(appDir, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(appDir, 'src'))).toBe(true);
  });
});
