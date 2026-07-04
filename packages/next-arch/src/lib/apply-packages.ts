import fs from 'fs-extra';
import path from 'path';
import {
  getPackageTemplates,
  resolveDependencies,
  type InitSelections,
} from './packages.js';
import { copyTemplateTree } from './template.js';
import { resolveTemplatesDir } from './paths.js';
import { generateProviders } from './generate-providers.js';

async function mergePackageJson(
  targetDir: string,
  selections: InitSelections,
): Promise<void> {
  const packageJsonPath = path.join(targetDir, 'package.json');
  const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  const { dependencies, devDependencies } = resolveDependencies(selections);

  pkg.dependencies = { ...pkg.dependencies, ...dependencies };
  pkg.devDependencies = { ...pkg.devDependencies, ...devDependencies };

  await fs.writeFile(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

export async function applyPackageSelections(
  targetDir: string,
  selections: InitSelections,
): Promise<string[]> {
  const packagesDir = path.join(resolveTemplatesDir(), 'packages');
  const created: string[] = [];

  await mergePackageJson(targetDir, selections);

  for (const templateId of getPackageTemplates(selections)) {
    const templateRoot = path.join(packagesDir, templateId);
    const coreSrc = path.join(templateRoot, 'core', 'src');
    const examplesSrc = path.join(templateRoot, 'examples', 'src');

    if (await fs.pathExists(coreSrc)) {
      const files = await copyTemplateTree(coreSrc, path.join(targetDir, 'src'));
      created.push(...files);
    }

    if (selections.withExamples && (await fs.pathExists(examplesSrc))) {
      const files = await copyTemplateTree(examplesSrc, path.join(targetDir, 'src'));
      created.push(...files);
    }
  }

  const providersPath = await generateProviders(targetDir, selections);
  created.push(providersPath);

  return created;
}
