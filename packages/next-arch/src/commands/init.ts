import { confirm, intro, log, outro } from '@clack/prompts';
import fs from 'fs-extra';
import path from 'path';
import { applyPackageSelections } from '../lib/apply-packages.js';
import { applyProjectType } from '../lib/apply-project-type.js';
import { copyProjectTemplate } from '../lib/copy.js';
import { promptInitSelections } from '../lib/init-prompts.js';
import { formatSelectionsSummary, type ProjectType } from '../lib/packages.js';
import { getPackageRoot, resolveAppTemplateDir } from '../lib/paths.js';
import { resolveInitOutputDir } from '../lib/project-paths.js';

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

export interface InitCommandOptions {
  /** Parent directory where `<projectName>/` is created. */
  outputDir?: string;
  yes?: boolean;
  noExamples?: boolean;
  projectType?: ProjectType;
}

export async function initCommand(
  projectName: string,
  options: InitCommandOptions = {},
): Promise<void> {
  const baseDir = resolveInitOutputDir(options.outputDir);
  intro('Creating new Next Architecture project...');

  const selections = await promptInitSelections({
    yes: options.yes,
    noExamples: options.noExamples,
    projectType: options.projectType,
  });

  const targetDir = path.join(baseDir, projectName);
  const templateDir = resolveAppTemplateDir();

  if (await fs.pathExists(targetDir)) {
    if (options.yes) {
      log.info(`Directory "${projectName}" already exists — merging template files.`);
    } else {
      const shouldContinue = await confirm({
        message: 'Directory already exists. Continue and merge files?',
      });

      if (!shouldContinue) {
        outro('Cancelled');
        return;
      }
    }
  }

  log.info('Package setup:');
  for (const line of formatSelectionsSummary(selections)) {
    log.info(`  ${line}`);
  }

  log.info(`Copying template from ${path.basename(templateDir)}...`);
  await copyProjectTemplate(templateDir, targetDir);
  await bundleEslintPlugin(targetDir);
  await patchPackageJson(targetDir, projectName);
  await applyProjectType(targetDir, selections.projectType);
  await applyPackageSelections(targetDir, selections);

  log.success(`Project "${projectName}" created`);
  log.info(`  cd ${projectName}`);
  log.info('  npm install');
  log.info('  npm run dev');
  if (selections.withExamples) {
    log.info('  See src/features/_examples/ for commented package examples');
  }
  outro('Done!');
}
