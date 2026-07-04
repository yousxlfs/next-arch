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
