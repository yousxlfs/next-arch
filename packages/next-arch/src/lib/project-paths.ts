import fs from 'fs-extra';
import path from 'path';

/** Project root for doctor, generate, and page commands. */
export function resolveProjectRoot(cwd?: string): string {
  return path.resolve(cwd ?? process.cwd());
}

/** Parent directory where init creates `<projectName>/`. */
export function resolveInitOutputDir(outputDir?: string): string {
  return path.resolve(outputDir ?? process.cwd());
}

export function assertNextProject(projectRoot: string): void {
  const packageJson = path.join(projectRoot, 'package.json');
  const srcDir = path.join(projectRoot, 'src');

  if (!fs.existsSync(packageJson) || !fs.existsSync(srcDir)) {
    throw new Error('Run this command from the root of a Next Architecture project.');
  }
}
