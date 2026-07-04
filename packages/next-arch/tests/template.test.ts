import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  buildReplacements,
  copyTemplateTree,
  renderTemplateDir,
} from '../src/lib/template.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, '.tmp-template');
const sourceDir = path.join(tmpDir, 'source');
const targetDir = path.join(tmpDir, 'target');

describe('template helpers', () => {
  beforeEach(async () => {
    await fs.remove(tmpDir);
    await fs.ensureDir(sourceDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('buildReplacements maps all placeholder keys', () => {
    const r = buildReplacements('orders', 'Orders', 'orders');
    expect(r).toEqual({
      '{{Name}}': 'Orders',
      '{{name}}': 'orders',
      '{{NAME}}': 'ORDERS',
    });
  });

  it('renderTemplateDir replaces placeholders in file names and content', async () => {
    await fs.ensureDir(path.join(sourceDir, '{{name}}'));
    await fs.writeFile(
      path.join(sourceDir, '{{name}}', '{{Name}}Card.tsx'),
      "export function {{Name}}Card() { return '{{name}}'; }\n",
    );

    const replacements = buildReplacements('orders', 'Orders', 'orders');
    const created = await renderTemplateDir(sourceDir, targetDir, replacements);

    expect(created.some((p) => p.endsWith('orders/OrdersCard.tsx'))).toBe(true);
    const content = await fs.readFile(path.join(targetDir, 'orders', 'OrdersCard.tsx'), 'utf8');
    expect(content).toContain('export function OrdersCard()');
    expect(content).toContain("'orders'");
  });

  it('renderTemplateDir throws when template is missing', async () => {
    await expect(
      renderTemplateDir(path.join(tmpDir, 'missing'), targetDir, buildReplacements('x', 'X', 'x')),
    ).rejects.toThrow(/not found/);
  });

  it('copyTemplateTree copies files without placeholder substitution', async () => {
    await fs.writeFile(path.join(sourceDir, 'keep.txt'), 'raw {{Name}}\n');
    const created = await copyTemplateTree(sourceDir, targetDir);

    expect(created).toHaveLength(1);
    expect(await fs.readFile(path.join(targetDir, 'keep.txt'), 'utf8')).toBe('raw {{Name}}\n');
  });

  it('copyTemplateTree returns empty array when source is missing', async () => {
    const created = await copyTemplateTree(path.join(tmpDir, 'nope'), targetDir);
    expect(created).toEqual([]);
  });
});
