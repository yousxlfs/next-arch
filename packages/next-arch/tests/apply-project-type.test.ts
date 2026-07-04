import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyProjectType } from '../src/lib/apply-project-type.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, '.tmp-apply-project-type');

async function scaffoldFullLayout(): Promise<void> {
  await fs.ensureDir(path.join(tmpDir, 'src', 'app'));
  await fs.ensureDir(path.join(tmpDir, 'src', 'views', 'HomeView'));
  await fs.ensureDir(path.join(tmpDir, 'src', 'widgets', 'header'));
  await fs.ensureDir(path.join(tmpDir, 'src', 'entities', 'user'));
  await fs.writeFile(path.join(tmpDir, 'src', 'app', 'page.tsx'), 'export default function Page() {}\n');
  await fs.writeFile(path.join(tmpDir, 'src', 'views', 'HomeView', 'index.tsx'), 'export {};\n');
  await fs.writeFile(path.join(tmpDir, 'src', 'widgets', 'header', 'index.ts'), 'export {};\n');
  await fs.writeFile(path.join(tmpDir, 'src', 'entities', 'user', 'index.ts'), 'export {};\n');
}

describe('applyProjectType', () => {
  beforeEach(async () => {
    await fs.remove(tmpDir);
    await scaffoldFullLayout();
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('full keeps all FSD layers untouched', async () => {
    await applyProjectType(tmpDir, 'full');

    expect(await fs.pathExists(path.join(tmpDir, 'src/views/HomeView/index.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'src/widgets/header/index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'src/entities/user/index.ts'))).toBe(true);
  });

  it('standard removes views and widgets but keeps entities', async () => {
    await applyProjectType(tmpDir, 'standard');

    expect(await fs.pathExists(path.join(tmpDir, 'src/views'))).toBe(false);
    expect(await fs.pathExists(path.join(tmpDir, 'src/widgets'))).toBe(false);
    expect(await fs.pathExists(path.join(tmpDir, 'src/entities/user/index.ts'))).toBe(true);

    const page = await fs.readFile(path.join(tmpDir, 'src/app/page.tsx'), 'utf8');
    expect(page).toContain("from '@/features/demo'");
  });

  it('simple removes views, widgets, and entities', async () => {
    await applyProjectType(tmpDir, 'simple');

    expect(await fs.pathExists(path.join(tmpDir, 'src/views'))).toBe(false);
    expect(await fs.pathExists(path.join(tmpDir, 'src/widgets'))).toBe(false);
    expect(await fs.pathExists(path.join(tmpDir, 'src/entities'))).toBe(false);

    const page = await fs.readFile(path.join(tmpDir, 'src/app/page.tsx'), 'utf8');
    expect(page).toContain('FeatureDemo');
  });
});
