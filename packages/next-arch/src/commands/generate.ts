import { log } from '@clack/prompts';
import fs from 'fs-extra';
import path from 'path';
import { assertValidSliceName, toKebabCase, toPascalCase } from '../lib/naming.js';
import { resolveTemplatesDir } from '../lib/paths.js';

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

function assertNextProject(cwd: string): void {
  const packageJson = path.join(cwd, 'package.json');
  const srcDir = path.join(cwd, 'src');

  if (!fs.existsSync(packageJson) || !fs.existsSync(srcDir)) {
    throw new Error('Run this command from the root of a Next Architecture project.');
  }
}

async function renderTemplateDir(
  templateDir: string,
  targetDir: string,
  replacements: Record<string, string>,
): Promise<string[]> {
  const created: string[] = [];

  if (!(await fs.pathExists(templateDir))) {
    throw new Error(`Template "${path.basename(templateDir)}" not found.`);
  }

  const entries = await fs.readdir(templateDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(templateDir, entry.name);
    const renderedName = Object.entries(replacements).reduce(
      (name, [from, to]) => name.replaceAll(from, to),
      entry.name,
    );
    const targetPath = path.join(targetDir, renderedName);

    if (entry.isDirectory()) {
      await fs.ensureDir(targetPath);
      created.push(...(await renderTemplateDir(sourcePath, targetPath, replacements)));
      continue;
    }

    await fs.ensureDir(path.dirname(targetPath));
    let content = await fs.readFile(sourcePath, 'utf8');
    for (const [from, to] of Object.entries(replacements)) {
      content = content.replaceAll(from, to);
    }
    await fs.writeFile(targetPath, content);
    created.push(path.relative(process.cwd(), targetPath));
  }

  return created;
}

export async function generateCommand(
  type: string,
  name: string,
  projectRoot = process.cwd(),
  options: { force?: boolean } = {},
): Promise<void> {
  const root = path.resolve(projectRoot);
  assertNextProject(root);
  assertValidSliceName(name);

  if (!isSliceType(type)) {
    throw new Error(`Unknown type "${type}". Use: ${SLICE_TYPES.join(', ')}`);
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

    const replacements = {
      '{{Name}}': pascalName,
      '{{name}}': kebabName,
    };

    const created = await renderTemplateDir(templateDir, targetDir, replacements);

    log.success(`Created ${type} "${kebabName}" in ${root}`);
    for (const file of created) {
      log.info(`  ${file}`);
    }

    if (type === 'view') {
      log.info(`Add to a route: import { ${pascalName} } from '@/views/${kebabName}';`);
    }
  } finally {
    process.chdir(previousCwd);
  }
}
