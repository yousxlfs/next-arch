import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { pageCommand } from '../src/commands/page.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, '.tmp-page-presets');

async function createMinimalProject(): Promise<void> {
  await fs.ensureDir(path.join(tmpDir, 'src', 'features'));
  await fs.ensureDir(path.join(tmpDir, 'src', 'views'));
  await fs.ensureDir(path.join(tmpDir, 'src', 'entities'));
  await fs.ensureDir(path.join(tmpDir, 'src', 'app'));
  await fs.writeJson(path.join(tmpDir, 'package.json'), { name: 'test-project' });
}

describe('page presets', () => {
  beforeEach(async () => {
    await createMinimalProject();
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('crud preset uses ui/ not components/', async () => {
    await pageCommand('orders', tmpDir, { yes: true, preset: 'crud' });
    expect(await fs.pathExists(path.join(tmpDir, 'src/features/orders/ui/OrdersList.tsx'))).toBe(
      true,
    );
    expect(
      await fs.pathExists(path.join(tmpDir, 'src/features/orders/components/OrdersList.tsx')),
    ).toBe(false);
  });

  it('auth preset creates login feature and route', async () => {
    await pageCommand('login', tmpDir, { yes: true, preset: 'auth' });
    expect(await fs.pathExists(path.join(tmpDir, 'src/app/(login)/login/page.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'src/features/login/index.ts'))).toBe(true);
  });

  it('blank preset creates minimal view and route', async () => {
    await pageCommand('about', tmpDir, { yes: true, preset: 'blank' });
    expect(await fs.pathExists(path.join(tmpDir, 'src/app/about/page.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'src/views/about/index.ts'))).toBe(true);
  });

  it('dashboard preset creates layout and analytics feature', async () => {
    await pageCommand('dashboard', tmpDir, { yes: true, preset: 'dashboard' });
    expect(await fs.pathExists(path.join(tmpDir, 'src/app/dashboard/layout.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'src/features/dashboard/index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'src/views/dashboard/index.ts'))).toBe(true);
  });

  it('profile preset creates profile route and entity', async () => {
    await pageCommand('profile', tmpDir, { yes: true, preset: 'profile' });
    expect(await fs.pathExists(path.join(tmpDir, 'src/app/profile/page.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'src/features/profile/index.ts'))).toBe(true);
  });

  it('settings preset creates settings tabs feature', async () => {
    await pageCommand('settings', tmpDir, { yes: true, preset: 'settings' });
    expect(await fs.pathExists(path.join(tmpDir, 'src/app/settings/page.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'src/features/settings/index.ts'))).toBe(true);
  });
});
