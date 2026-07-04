import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { pageCommand } from '../src/commands/page.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, '.tmp-page');

async function createMinimalProject(): Promise<void> {
  await fs.ensureDir(path.join(tmpDir, 'src', 'features'));
  await fs.ensureDir(path.join(tmpDir, 'src', 'views'));
  await fs.ensureDir(path.join(tmpDir, 'src', 'entities'));
  await fs.ensureDir(path.join(tmpDir, 'src', 'app'));
  await fs.writeJson(path.join(tmpDir, 'package.json'), { name: 'test-project' });
}

describe('page crud preset', () => {
  beforeEach(async () => {
    await createMinimalProject();
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('uses slice name in feature exports, not hardcoded Product*', async () => {
    await pageCommand('orders', tmpDir, { yes: true, preset: 'crud' });

    const featureIndex = await fs.readFile(
      path.join(tmpDir, 'src/features/orders/index.ts'),
      'utf8',
    );
    const listView = await fs.readFile(
      path.join(tmpDir, 'src/views/orders/OrdersListView.tsx'),
      'utf8',
    );

    expect(featureIndex).toContain("export { OrdersList } from './components/OrdersList'");
    expect(featureIndex).toContain('useOrdersListQuery');
    expect(featureIndex).not.toMatch(/Product|Orderss/);
    expect(listView).toContain('<OrdersList />');
    expect(listView).not.toMatch(/Product|Orderss/);

    expect(await fs.pathExists(path.join(tmpDir, 'src/features/orders/components/OrdersList.tsx'))).toBe(
      true,
    );
    expect(await fs.pathExists(path.join(tmpDir, 'src/features/orders/components/OrdersForm.tsx'))).toBe(
      true,
    );
    expect(
      await fs.pathExists(path.join(tmpDir, 'src/features/orders/queries/use-orders-list.query.ts')),
    ).toBe(true);
  });
});
