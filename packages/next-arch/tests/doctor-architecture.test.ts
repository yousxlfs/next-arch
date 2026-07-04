import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { runDoctorChecks } from '../src/lib/doctor-checks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, '.tmp-doctor-arch');

async function setupBaseProject(): Promise<void> {
  await fs.ensureDir(path.join(tmpDir, 'src', 'shared', 'lib'));
  await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'cart'));
  await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'auth'));
  await fs.writeFile(path.join(tmpDir, 'src', 'features', 'cart', 'index.ts'), 'export {};\n');
  await fs.writeFile(path.join(tmpDir, 'src', 'features', 'auth', 'index.ts'), 'export {};\n');
  await fs.writeJson(path.join(tmpDir, 'package.json'), { name: 'doctor-arch-test' });
}

function hasError(issues: Awaited<ReturnType<typeof runDoctorChecks>>, pattern: RegExp | string): boolean {
  const re = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  return issues.some((i) => i.level === 'error' && re.test(i.message));
}

describe('doctor architecture — structure', () => {
  beforeEach(async () => {
    await fs.remove(tmpDir);
    await setupBaseProject();
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('errors when src/ is missing', async () => {
    await fs.remove(path.join(tmpDir, 'src'));
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /Missing src/)).toBe(true);
  });

  it('errors when shared/ layer is missing', async () => {
    await fs.remove(path.join(tmpDir, 'src', 'shared'));
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /Missing shared/)).toBe(true);
  });

  it('warns when features/ layer is missing', async () => {
    await fs.remove(path.join(tmpDir, 'src', 'features'));
    const issues = await runDoctorChecks(tmpDir);
    expect(issues.some((i) => i.level === 'warning' && i.message.includes('features/'))).toBe(true);
  });

  it('skips _examples features for index check', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'features', '_examples', 'demo'));
    const issues = await runDoctorChecks(tmpDir);
    expect(
      issues.some((i) => i.message.includes('_examples') && i.level === 'error'),
    ).toBe(false);
  });

  it('reports info when feature has public index', async () => {
    const issues = await runDoctorChecks(tmpDir);
    expect(issues.some((i) => i.message.includes('features/cart has public index'))).toBe(true);
  });
});

describe('doctor architecture — import violations', () => {
  beforeEach(async () => {
    await fs.remove(tmpDir);
    await setupBaseProject();
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('detects relative cross-feature imports', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'cart', 'ui'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'features', 'cart', 'ui', 'Cart.tsx'),
      "import { x } from '../../auth/hooks/useUser';\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /features\/cart → features\/auth/)).toBe(true);
  });

  it('detects cross-feature via @features alias', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'cart', 'ui'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'features', 'cart', 'ui', 'Cart.tsx'),
      "import { x } from '@features/auth';\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /features\/cart → features\/auth/)).toBe(true);
  });

  it('detects deep imports from widgets layer', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'widgets', 'header', 'ui'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'widgets', 'header', 'ui', 'Header.tsx'),
      "import { CartButton } from '@/features/cart/ui/CartButton';\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /no-deep-imports/)).toBe(true);
  });

  it('detects upward import from entities to features', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'entities', 'user'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'entities', 'user', 'model.ts'),
      "import { Cart } from '@/features/cart';\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /no-upward-imports/)).toBe(true);
  });

  it('detects upward import from features to views', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'cart', 'ui'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'features', 'cart', 'ui', 'Cart.tsx'),
      "import { HomeView } from '@/views/HomeView';\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /no-upward-imports/)).toBe(true);
  });

  it('detects server-only package in client file', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'cart', 'ui'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'features', 'cart', 'ui', 'Client.tsx'),
      "'use client';\nimport 'server-only';\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /no-server-in-client/)).toBe(true);
  });

  it('detects next/cache in client file', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'cart', 'ui'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'features', 'cart', 'ui', 'Client.tsx'),
      "'use client';\nimport { revalidatePath } from 'next/cache';\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /no-server-in-client/)).toBe(true);
  });

  it('detects server path imports in client file', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'cart', 'ui'));
    await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'cart', 'server'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'features', 'cart', 'server', 'actions.ts'),
      'export {};\n',
    );
    await fs.writeFile(
      path.join(tmpDir, 'src', 'features', 'cart', 'ui', 'Client.tsx'),
      "'use client';\nimport { x } from '@/features/cart/server/actions';\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /no-server-in-client/)).toBe(true);
  });

  it('detects dynamic import() in client violating cross-feature', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'cart', 'ui'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'features', 'cart', 'ui', 'Client.tsx'),
      "'use client';\nconst load = () => import('@/features/auth/hooks/useUser');\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /features\/cart → features\/auth/)).toBe(true);
  });

  it('allows valid shared import from feature', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'cart', 'ui'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'features', 'cart', 'ui', 'Cart.tsx'),
      "import { cn } from '@/shared/lib/utils';\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /cross-feature|upward|deep|server/)).toBe(false);
  });

  it('allows public feature barrel import from views', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'views', 'home'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'views', 'home', 'HomeView.tsx'),
      "import { Cart } from '@/features/cart';\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /no-deep-imports/)).toBe(false);
    expect(hasError(issues, /no-upward-imports/)).toBe(false);
  });

  it('detects upward import from root components/ layer', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'components'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'components', 'Button.tsx'),
      "import { Cart } from '@/features/cart';\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /no-upward-imports/)).toBe(true);
  });

  it('detects upward import from root lib/ layer', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'lib'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'lib', 'helpers.ts'),
      "import { HomeView } from '@/views/HomeView';\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /no-upward-imports/)).toBe(true);
  });

  it('detects export-from cross-feature re-export', async () => {
    await fs.writeFile(
      path.join(tmpDir, 'src', 'features', 'cart', 'index.ts'),
      "export { useUser } from '@/features/auth/hooks/useUser';\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /features\/cart → features\/auth/)).toBe(true);
  });

  it('detects fs import in client file', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'cart', 'ui'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'features', 'cart', 'ui', 'Client.tsx'),
      "'use client';\nimport fs from 'node:fs';\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(hasError(issues, /no-server-in-client/)).toBe(true);
  });
});
