import fs from 'fs-extra';
import path from 'path';

export type DoctorLevel = 'error' | 'warning' | 'info';

export interface DoctorIssue {
  level: DoctorLevel;
  message: string;
  file?: string;
}

const SERVER_PACKAGES = new Set([
  'server-only',
  'next/headers',
  'next/cache',
  'next/server',
  'fs',
  'fs/promises',
  'node:fs',
  'node:fs/promises',
  'child_process',
  'node:child_process',
]);

const IMPORT_RE =
  /(?:import|export)\s+(?:type\s+)?(?:[\w*{}\s,]+)\s+from\s+['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

function normalizePath(value: string): string {
  return value.replace(/\\/g, '/');
}

function getFeatureName(relativePath: string): string | null {
  const match = relativePath.match(/^features\/([^/]+)/);
  return match?.[1] ?? null;
}

function resolveImportSource(
  importSource: string,
  filePath: string,
  srcDir: string,
): string | null {
  if (importSource.startsWith('@/')) {
    return importSource.slice(2);
  }

  if (importSource.startsWith('@features/')) {
    return `features/${importSource.slice('@features/'.length)}`;
  }

  if (importSource.startsWith('@shared/')) {
    return `shared/${importSource.slice('@shared/'.length)}`;
  }

  if (importSource.startsWith('@entities/')) {
    return `entities/${importSource.slice('@entities/'.length)}`;
  }

  if (importSource.startsWith('@views/')) {
    return `views/${importSource.slice('@views/'.length)}`;
  }

  if (importSource.startsWith('@widgets/')) {
    return `widgets/${importSource.slice('@widgets/'.length)}`;
  }

  if (importSource.startsWith('.')) {
    const fileDir = path.dirname(filePath);
    const resolved = normalizePath(path.join(fileDir, importSource));
    const srcMarker = `/${srcDir}/`;
    const index = resolved.indexOf(srcMarker);
    if (index === -1) return null;
    return resolved.slice(index + srcMarker.length).replace(/\/index$/, '');
  }

  return null;
}

async function collectSourceFiles(dir: string, files: string[] = []): Promise<string[]> {
  if (!(await fs.pathExists(dir))) {
    return files;
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      await collectSourceFiles(fullPath, files);
      continue;
    }

    if (/\.(tsx?|jsx?|mts)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractImports(content: string): string[] {
  const imports: string[] = [];
  let match: RegExpExecArray | null;

  IMPORT_RE.lastIndex = 0;
  while ((match = IMPORT_RE.exec(content)) !== null) {
    const source = match[1] ?? match[2];
    if (source) imports.push(source);
  }

  return imports;
}

function hasUseClientDirective(content: string): boolean {
  return /^(['"])use client\1;?\s*$/m.test(content.trimStart().split('\n').slice(0, 3).join('\n'));
}

export async function runDoctorChecks(projectRoot: string): Promise<DoctorIssue[]> {
  const issues: DoctorIssue[] = [];
  const srcDir = path.join(projectRoot, 'src');

  if (!(await fs.pathExists(srcDir))) {
    issues.push({ level: 'error', message: 'Missing src/ directory — not a Next Architecture project.' });
    return issues;
  }

  const sharedDir = path.join(srcDir, 'shared');
  const featuresDir = path.join(srcDir, 'features');

  if (await fs.pathExists(sharedDir)) {
    issues.push({ level: 'info', message: 'FSD layer shared/ exists' });
  } else {
    issues.push({ level: 'error', message: 'Missing shared/ layer' });
  }

  if (await fs.pathExists(featuresDir)) {
    issues.push({ level: 'info', message: 'FSD layer features/ exists' });
  } else {
    issues.push({ level: 'warning', message: 'Missing features/ layer' });
  }

  if (!(await fs.pathExists(featuresDir))) {
    return issues;
  }

  const featureEntries = await fs.readdir(featuresDir, { withFileTypes: true });
  const featureNames = featureEntries.filter((e) => e.isDirectory()).map((e) => e.name);

  for (const featureName of featureNames) {
    if (featureName.startsWith('_')) continue;

    const indexPath = path.join(featuresDir, featureName, 'index.ts');
    const indexTsxPath = path.join(featuresDir, featureName, 'index.tsx');

    if ((await fs.pathExists(indexPath)) || (await fs.pathExists(indexTsxPath))) {
      issues.push({ level: 'info', message: `features/${featureName} has public index`, file: `features/${featureName}` });
    } else {
      issues.push({
        level: 'error',
        message: `features/${featureName} missing index.ts — add a public API barrel file`,
        file: `features/${featureName}`,
      });
    }
  }

  const sourceFiles = await collectSourceFiles(srcDir);
  const crossFeatureCounts = new Map<string, number>();
  const serverInClientFiles: string[] = [];

  for (const filePath of sourceFiles) {
    const content = await fs.readFile(filePath, 'utf8');
    const relativeFile = normalizePath(path.relative(srcDir, filePath));
    const currentFeature = getFeatureName(relativeFile);
    const imports = extractImports(content);

    for (const importSource of imports) {
      const resolved = resolveImportSource(importSource, filePath, 'src');
      if (!resolved) {
        if (hasUseClientDirective(content) && SERVER_PACKAGES.has(importSource)) {
          serverInClientFiles.push(relativeFile);
        }
        continue;
      }

      const importedFeature = getFeatureName(resolved);
      if (
        currentFeature &&
        importedFeature &&
        currentFeature !== importedFeature &&
        !resolved.endsWith('/index') &&
        resolved !== `features/${importedFeature}`
      ) {
        crossFeatureCounts.set(
          `features/${currentFeature} → features/${importedFeature}`,
          (crossFeatureCounts.get(`features/${currentFeature} → features/${importedFeature}`) ?? 0) + 1,
        );
      }

      if (hasUseClientDirective(content)) {
        if (SERVER_PACKAGES.has(importSource)) {
          serverInClientFiles.push(relativeFile);
        }
        if (resolved.includes('/server/') || resolved.endsWith('.server.ts') || resolved.endsWith('.server.tsx')) {
          serverInClientFiles.push(relativeFile);
        }
      }
    }
  }

  for (const [pair, count] of crossFeatureCounts) {
    issues.push({
      level: 'warning',
      message: `${pair} direct import (${count} file${count === 1 ? '' : 's'}) — pass data via props or move logic to shared/`,
    });
  }

  const uniqueServerInClient = [...new Set(serverInClientFiles)];
  for (const file of uniqueServerInClient) {
    issues.push({
      level: 'error',
      message: `'use client' file imports server-only code — move to actions/ or pass via props`,
      file,
    });
  }

  return issues;
}
