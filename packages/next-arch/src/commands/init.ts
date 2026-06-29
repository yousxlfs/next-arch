import { confirm, intro, log, outro } from '@clack/prompts';
import fs from 'fs-extra';
import path from 'path';
import { copyProjectTemplate } from '../lib/copy.js';
import { getPackageRoot, resolveAppTemplateDir } from '../lib/paths.js';

async function resolveEslintPluginSource(): Promise<string> {
  const packageRoot = getPackageRoot();
  const candidates = [
    path.join(packageRoot, 'vendor', 'eslint-plugin-next-arch'),
    path.resolve(packageRoot, '..', '..', 'packages', 'eslint-plugin-next-arch'),
  ];

  for (const candidate of candidates) {
    if (await fs.pathExists(path.join(candidate, 'dist', 'index.js'))) {
      return candidate;
    }
  }

  throw new Error(
    'eslint-plugin-next-arch is not available. Reinstall next-arch or run "pnpm build" in the monorepo.',
  );
}

async function bundleEslintPlugin(targetDir: string): Promise<void> {
  const pluginSource = await resolveEslintPluginSource();
  const pluginTarget = path.join(targetDir, 'vendor', 'eslint-plugin-next-arch');

  await fs.ensureDir(pluginTarget);
  await fs.copy(path.join(pluginSource, 'dist'), path.join(pluginTarget, 'dist'));
  await fs.copy(path.join(pluginSource, 'package.json'), path.join(pluginTarget, 'package.json'));
}

async function patchPackageJson(targetDir: string, projectName: string): Promise<void> {
  const packageJsonPath = path.join(targetDir, 'package.json');
  const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf8')) as {
    name: string;
    scripts?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  pkg.name = projectName;
  delete pkg.scripts?.arch;
  if (pkg.devDependencies) {
    pkg.devDependencies['eslint-plugin-next-arch'] = 'file:./vendor/eslint-plugin-next-arch';
  }

  await fs.writeFile(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

export async function initCommand(
  projectName: string,
  options: { cwd?: string } = {},
): Promise<void> {
  const baseDir = path.resolve(options.cwd ?? process.cwd());
  intro('Creating new Next Architecture project...');

  const targetDir = path.join(baseDir, projectName);
  const templateDir = resolveAppTemplateDir();

  if (await fs.pathExists(targetDir)) {
    const shouldContinue = await confirm({
      message: 'Directory already exists. Continue and merge files?',
    });

    if (!shouldContinue) {
      outro('Cancelled');
      return;
    }
  }

  log.info(`Copying template from ${path.basename(templateDir)}...`);
  await copyProjectTemplate(templateDir, targetDir);
  await bundleEslintPlugin(targetDir);
  await patchPackageJson(targetDir, projectName);
  await fs.writeFile(path.join(targetDir, '.npmrc'), 'ignore-workspace=true\n');

  log.success(`Project "${projectName}" created`);
  log.info(`  cd ${projectName}`);
  log.info('  pnpm install');
  log.info('  pnpm dev');
  outro('Done!');
}
