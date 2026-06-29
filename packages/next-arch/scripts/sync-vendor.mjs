import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pluginSource = path.resolve(packageRoot, '..', 'eslint-plugin-next-arch');
const pluginTarget = path.join(packageRoot, 'vendor', 'eslint-plugin-next-arch');
const pluginDist = path.join(pluginSource, 'dist', 'index.js');

if (!fs.existsSync(pluginDist)) {
  console.error('eslint-plugin-next-arch is not built. Run pnpm build first.');
  process.exit(1);
}

fs.mkdirSync(pluginTarget, { recursive: true });
fs.cpSync(path.join(pluginSource, 'dist'), path.join(pluginTarget, 'dist'), { recursive: true });
fs.copyFileSync(
  path.join(pluginSource, 'package.json'),
  path.join(pluginTarget, 'package.json'),
);

console.log('Synced eslint-plugin-next-arch into next-arch/vendor/');
