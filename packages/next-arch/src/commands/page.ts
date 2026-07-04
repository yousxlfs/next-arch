import { log } from '@clack/prompts';
import fs from 'fs-extra';
import path from 'path';
import { assertValidSliceName, toKebabCase, toPascalCase } from '../lib/naming.js';
import { promptPagePreset } from '../lib/page-prompts.js';
import type { PagePreset } from '../lib/page-presets.js';
import { resolveTemplatesDir } from '../lib/paths.js';
import { assertNextProject, resolveProjectRoot } from '../lib/project-paths.js';
import { buildReplacements, renderTemplateDir } from '../lib/template.js';

async function pathExistsAny(paths: string[]): Promise<boolean> {
  for (const candidate of paths) {
    if (await fs.pathExists(candidate)) {
      return true;
    }
  }
  return false;
}

export interface PageCommandOptions {
  force?: boolean;
  yes?: boolean;
  preset?: PagePreset;
}

export async function pageCommand(
  name: string,
  projectRoot = process.cwd(),
  options: PageCommandOptions = {},
): Promise<void> {
  const root = resolveProjectRoot(projectRoot);
  assertNextProject(root);
  assertValidSliceName(name);

  const preset = await promptPagePreset({ yes: options.yes, preset: options.preset });
  const pascalName = toPascalCase(name);
  const kebabName = toKebabCase(name);
  const templatesDir = resolveTemplatesDir();
  const templateDir = path.join(templatesDir, 'pages', preset);

  if (!(await fs.pathExists(templateDir))) {
    throw new Error(`Page preset "${preset}" template not found.`);
  }

  const targetDir = path.join(root, 'src');
  const replacements = buildReplacements(name, pascalName, kebabName);

  const conflictPaths = [
    path.join(targetDir, 'app', kebabName),
    path.join(targetDir, 'app', `(${kebabName})`),
    path.join(targetDir, 'views', kebabName),
    path.join(targetDir, 'features', kebabName),
    path.join(targetDir, 'entities', kebabName),
  ];

  if (!options.force && (await pathExistsAny(conflictPaths))) {
    throw new Error(
      `Page "${kebabName}" already exists. Use --force to overwrite conflicting paths.`,
    );
  }

  const previousCwd = process.cwd();
  process.chdir(root);

  try {
    if (options.force) {
      for (const conflictPath of conflictPaths) {
        if (await fs.pathExists(conflictPath)) {
          await fs.remove(conflictPath);
        }
      }
    }

    const created = await renderTemplateDir(templateDir, root, replacements);
    const relativeFiles = created.map((file) => path.relative(root, file));

    log.success(`Created ${preset} page "${kebabName}"`);
    for (const file of relativeFiles) {
      log.info(`  ${file}`);
    }

    if (preset === 'blank') {
      log.info(`Route: src/app/${kebabName}/page.tsx`);
    }
    if (preset === 'auth') {
      log.info(`Routes: src/app/(${kebabName})/login and register`);
    }
    if (preset === 'crud') {
      log.info(`Routes: src/app/${kebabName}, ${kebabName}/[id], ${kebabName}/new`);
    }
  } finally {
    process.chdir(previousCwd);
  }
}
