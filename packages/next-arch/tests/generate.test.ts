import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generateCommand } from '../src/commands/generate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, '.tmp-test');

async function createMinimalProject(): Promise<void> {
  await fs.ensureDir(path.join(tmpDir, 'src', 'features'));
  await fs.ensureDir(path.join(tmpDir, 'src', 'views'));
  await fs.ensureDir(path.join(tmpDir, 'src', 'entities'));
  await fs.writeJson(path.join(tmpDir, 'package.json'), { name: 'test-project' });
}

describe('generate feature', () => {
  beforeEach(async () => {
    await createMinimalProject();
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('creates index.ts', async () => {
    await generateCommand('feature', 'payments', tmpDir);
    expect(await fs.pathExists(path.join(tmpDir, 'src/features/payments/index.ts'))).toBe(true);
  });

  it('creates all subfolders', async () => {
    await generateCommand('feature', 'payments', tmpDir);
    for (const dir of ['ui', 'model', 'api', 'actions', 'lib', 'queries', 'types']) {
      expect(await fs.pathExists(path.join(tmpDir, 'src/features/payments', dir))).toBe(true);
    }
  });

  it('does not create slice AGENTS.md', async () => {
    await generateCommand('feature', 'payments', tmpDir);
    expect(await fs.pathExists(path.join(tmpDir, 'src/features/payments/AGENTS.md'))).toBe(false);
  });

  it('does not overwrite without --force', async () => {
    await generateCommand('feature', 'payments', tmpDir);
    await expect(generateCommand('feature', 'payments', tmpDir)).rejects.toThrow(/already exists/);
  });

  it('overwrites with --force', async () => {
    await generateCommand('feature', 'payments', tmpDir);
    await expect(generateCommand('feature', 'payments', tmpDir, { force: true })).resolves.toBeUndefined();
  });

  it('creates kebab-case slice from PascalCase input', async () => {
    await generateCommand('feature', 'UserProfile', tmpDir);
    expect(await fs.pathExists(path.join(tmpDir, 'src/features/user-profile/index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'src/features/user-profile/ui/UserProfile.tsx'))).toBe(
      true,
    );
  });

  it('rejects invalid slice names', async () => {
    await expect(generateCommand('feature', '../hack', tmpDir)).rejects.toThrow();
    await expect(generateCommand('feature', 'bad name', tmpDir)).rejects.toThrow();
  });
});

describe('generate view', () => {
  beforeEach(async () => {
    await createMinimalProject();
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('creates view with index.tsx', async () => {
    await generateCommand('view', 'dashboard', tmpDir);
    expect(await fs.pathExists(path.join(tmpDir, 'src/views/dashboard/index.tsx'))).toBe(true);
  });
});

describe('generate entity', () => {
  beforeEach(async () => {
    await createMinimalProject();
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('creates entity with types and card', async () => {
    await generateCommand('entity', 'user', tmpDir);
    expect(await fs.pathExists(path.join(tmpDir, 'src/entities/user/index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'src/entities/user/model/types.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'src/entities/user/ui/UserCard.tsx'))).toBe(true);
  });
});

describe('generate widget', () => {
  beforeEach(async () => {
    await createMinimalProject();
    await fs.ensureDir(path.join(tmpDir, 'src', 'widgets'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('creates widget with index.ts', async () => {
    await generateCommand('widget', 'header', tmpDir);
    expect(await fs.pathExists(path.join(tmpDir, 'src/widgets/header/index.ts'))).toBe(true);
  });
});
