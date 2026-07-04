import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { runDoctorChecks } from '../src/lib/doctor-checks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, '.tmp-doctor');

describe('doctor checks', () => {
  beforeEach(async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'shared'));
    await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'cart'));
    await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'auth'));
    await fs.writeFile(path.join(tmpDir, 'src', 'features', 'cart', 'index.ts'), 'export {};\n');
    await fs.writeFile(path.join(tmpDir, 'src', 'features', 'auth', 'index.ts'), 'export {};\n');
    await fs.writeJson(path.join(tmpDir, 'package.json'), { name: 'doctor-test' });
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('reports missing index.ts for features without public API', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'payments'));
    const issues = await runDoctorChecks(tmpDir);
    expect(issues.some((i) => i.level === 'error' && i.message.includes('payments'))).toBe(true);
  });

  it('detects cross-feature imports', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'cart', 'ui'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'features', 'cart', 'ui', 'Cart.tsx'),
      "import { useAuth } from '@/features/auth/hooks/useAuth';\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(issues.some((i) => i.level === 'warning' && i.message.includes('cart → features/auth'))).toBe(
      true,
    );
  });

  it('detects server imports in client files', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src', 'features', 'cart', 'ui'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'features', 'cart', 'ui', 'ClientCart.tsx'),
      "'use client';\nimport { cookies } from 'next/headers';\n",
    );
    const issues = await runDoctorChecks(tmpDir);
    expect(issues.some((i) => i.level === 'error' && i.message.includes('server-only'))).toBe(true);
  });
});
