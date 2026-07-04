import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runDoctorChecks } from '../src/lib/doctor-checks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const exampleAppDir = path.join(repoRoot, 'examples/next-app');

describe('examples/next-app — doctor integration', () => {
  it('example app directory exists', () => {
    expect(fs.existsSync(path.join(exampleAppDir, 'src'))).toBe(true);
  });

  it('passes doctor with no architecture errors', async () => {
    const issues = await runDoctorChecks(exampleAppDir);
    const errors = issues.filter((issue) => issue.level === 'error');

    expect(errors).toEqual([]);
  });

  it('reports healthy FSD structure for reference layers', async () => {
    const issues = await runDoctorChecks(exampleAppDir);
    const messages = issues.map((issue) => issue.message);

    expect(messages.some((m) => m.includes('FSD layer shared/ exists'))).toBe(true);
    expect(messages.some((m) => m.includes('FSD layer features/ exists'))).toBe(true);
    expect(messages.some((m) => m.includes('features/demo has public index'))).toBe(true);
  });
});
