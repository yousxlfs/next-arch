import fs from 'fs-extra';
import path from 'path';

const EXCLUDED_DIRS = new Set(['node_modules', '.next', '.turbo', 'dist']);

export async function copyProjectTemplate(
  sourceDir: string,
  targetDir: string,
): Promise<void> {
  await fs.copy(sourceDir, targetDir, {
    filter(src) {
      const relative = path.relative(sourceDir, src);
      if (!relative) return true;

      return !relative.split(path.sep).some((part) => EXCLUDED_DIRS.has(part));
    },
  });
}

export async function replaceInFile(
  filePath: string,
  replacements: Record<string, string>,
): Promise<void> {
  if (!(await fs.pathExists(filePath))) return;

  let content = await fs.readFile(filePath, 'utf8');
  for (const [from, to] of Object.entries(replacements)) {
    content = content.replaceAll(from, to);
  }
  await fs.writeFile(filePath, content);
}
