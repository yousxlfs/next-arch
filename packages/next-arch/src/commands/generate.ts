import { log } from '@clack/prompts';
import fs from 'fs-extra';
import path from 'path';
import type { PagePreset } from '../lib/page-presets.js';
import { pageCommand } from './page.js';
import { assertValidSliceName, toKebabCase, toPascalCase } from '../lib/naming.js';
import { resolveTemplatesDir } from '../lib/paths.js';
import { assertNextProject, resolveProjectRoot } from '../lib/project-paths.js';
import { buildReplacements, renderTemplateDir } from '../lib/template.js';

const SLICE_TYPES = ['feature', 'view', 'widget', 'entity'] as const;
type SliceType = (typeof SLICE_TYPES)[number];

const TARGET_DIRS: Record<SliceType, string> = {
  feature: 'features',
  view: 'views',
  widget: 'widgets',
  entity: 'entities',
};

function isSliceType(value: string): value is SliceType {
  return SLICE_TYPES.includes(value as SliceType);
}

export interface GenerateCommandOptions {
  force?: boolean;
  yes?: boolean;
  preset?: string;
}

export async function generateCommand(
  type: string,
  name: string,
  projectRoot = process.cwd(),
  options: GenerateCommandOptions = {},
): Promise<void> {
  if (type === 'page') {
    await pageCommand(name, projectRoot, {
      force: options.force,
      yes: options.yes,
      preset: options.preset as PagePreset | undefined,
    });
    return;
  }

  const root = resolveProjectRoot(projectRoot);
  assertNextProject(root);
  assertValidSliceName(name);

  if (!isSliceType(type)) {
    throw new Error(`Unknown type "${type}". Use: page, ${SLICE_TYPES.join(', ')}`);
  }

  const pascalName = toPascalCase(name);
  const kebabName = toKebabCase(name);
  const templatesDir = resolveTemplatesDir();
  const templateDir = path.join(templatesDir, type);
  const targetDir = path.join(root, 'src', TARGET_DIRS[type], kebabName);

  const previousCwd = process.cwd();
  process.chdir(root);

  try {
    if (await fs.pathExists(targetDir)) {
      if (!options.force) {
        throw new Error(
          `"${type}" "${kebabName}" already exists at ${targetDir}. Use --force to overwrite.`,
        );
      }
      await fs.remove(targetDir);
    }

    const replacements = buildReplacements(name, pascalName, kebabName);
    const created = await renderTemplateDir(templateDir, targetDir, replacements);
    const relativeFiles = created.map((file) => path.relative(root, file));

    log.success(`Created ${type} "${kebabName}" in ${root}`);
    for (const file of relativeFiles) {
      log.info(`  ${file}`);
    }

    if (type === 'view') {
      log.info(`Add to a route: import { ${pascalName} } from '@/views/${kebabName}';`);
    }
  } finally {
    process.chdir(previousCwd);
  }
}
