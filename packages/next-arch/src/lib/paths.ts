import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

function findPackageRoot(startDir: string): string {
  let current = startDir;

  while (current !== path.dirname(current)) {
    const packageJsonPath = path.join(current, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as { name?: string };
      if (pkg.name === 'next-arch') {
        return current;
      }
    }
    current = path.dirname(current);
  }

  throw new Error('next-arch package root not found.');
}

export function getPackageRoot(): string {
  return findPackageRoot(path.dirname(fileURLToPath(import.meta.url)));
}

export function resolveTemplatesDir(): string {
  const templatesDir = path.join(getPackageRoot(), 'templates');
  if (!fs.existsSync(templatesDir)) {
    throw new Error('Templates directory not found. Reinstall next-arch.');
  }
  return templatesDir;
}

export function resolveAppTemplateDir(): string {
  const appTemplate = path.join(resolveTemplatesDir(), 'app');
  if (!fs.existsSync(path.join(appTemplate, 'package.json'))) {
    throw new Error('App template not found. Reinstall next-arch.');
  }
  return appTemplate;
}
