import fs from 'fs-extra';
import path from 'path';

export type DoctorLevel = 'error' | 'warning' | 'info';

export interface DoctorIssue {
  level: DoctorLevel;
  message: string;
  file?: string;
}

const LAYER_RANK = {
  shared: 0,
  entities: 1,
  features: 2,
  widgets: 3,
  views: 4,
  app: 5,
} as const;

type Layer = keyof typeof LAYER_RANK;

const ALIAS_PREFIXES: Record<string, string> = {
  '@/': '',
  '@shared/': 'shared/',
  '@entities/': 'entities/',
  '@features/': 'features/',
  '@widgets/': 'widgets/',
  '@views/': 'views/',
  '@app/': 'app/',
};

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

function getProjectRoot(filename: string, srcDir: string): string | null {
  const normalized = normalizePath(filename);
  const marker = `/${srcDir}/`;
  const index = normalized.lastIndexOf(marker);
  if (index === -1) return null;
  return normalized.slice(0, index);
}

function getLayer(relativePath: string): Layer | null {
  const [first] = relativePath.split('/');
  if (first in LAYER_RANK) {
    return first as Layer;
  }
  if (first === 'components' || first === 'lib') {
    return 'shared';
  }
  return null;
}

function getLayerRank(layer: Layer | null): number | null {
  if (!layer) return null;
  return LAYER_RANK[layer];
}

function getFeatureName(relativePath: string): string | null {
  const match = relativePath.match(/^features\/([^/]+)/);
  return match?.[1] ?? null;
}

function isFeaturePublicImport(relativePath: string): boolean {
  const parts = relativePath.split('/');
  if (parts[0] !== 'features' || parts.length < 2) {
    return false;
  }

  return parts.length === 2 || (parts.length === 3 && parts[2] === 'index');
}

function resolveImportSource(
  importSource: string,
  filePath: string,
  srcDir: string,
): string | null {
  for (const [alias, prefix] of Object.entries(ALIAS_PREFIXES)) {
    if (importSource === alias.slice(0, -1) || importSource.startsWith(alias)) {
      const rest = importSource.slice(alias.length);
      return normalizePath(`${prefix}${rest}`).replace(/\/$/, '');
    }
  }

  if (!importSource.startsWith('.')) {
    return null;
  }

  const projectRoot = getProjectRoot(filePath, srcDir);
  if (!projectRoot) return null;

  const srcRoot = path.join(projectRoot, srcDir);
  const resolved = normalizePath(path.resolve(path.dirname(filePath), importSource));
  const srcRootNormalized = normalizePath(srcRoot);

  if (!resolved.startsWith(srcRootNormalized)) {
    return null;
  }

  return resolved.slice(srcRootNormalized.length + 1);
}

function resolveAbsoluteImportPath(
  importSource: string,
  filePath: string,
  srcDir: string,
): string | null {
  const relative = resolveImportSource(importSource, filePath, srcDir);
  if (!relative) return null;

  const projectRoot = getProjectRoot(filePath, srcDir);
  if (!projectRoot) return null;

  return path.join(projectRoot, srcDir, relative);
}

function readModuleDirectives(absolutePath: string): { client: boolean; server: boolean } {
  const candidates = [
    absolutePath,
    `${absolutePath}.ts`,
    `${absolutePath}.tsx`,
    `${absolutePath}.js`,
    `${absolutePath}.jsx`,
    path.join(absolutePath, 'index.ts'),
    path.join(absolutePath, 'index.tsx'),
    path.join(absolutePath, 'index.js'),
    path.join(absolutePath, 'index.jsx'),
  ];

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
      continue;
    }

    const content = fs.readFileSync(candidate, 'utf8');
    return {
      client: /['"]use client['"]/.test(content),
      server: /['"]use server['"]/.test(content),
    };
  }

  return { client: false, server: false };
}

function isServerPath(relativePath: string): boolean {
  return relativePath.includes('/server/') || /\.server(?:\.tsx?)?$/.test(relativePath);
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
  return /['"]use client['"]/.test(content);
}

export async function runDoctorChecks(projectRoot: string): Promise<DoctorIssue[]> {
  const issues: DoctorIssue[] = [];
  const srcDirName = 'src';
  const srcDir = path.join(projectRoot, srcDirName);

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
      issues.push({
        level: 'info',
        message: `features/${featureName} has public index`,
        file: `features/${featureName}`,
      });
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
  const deepImportCounts = new Map<string, number>();
  const upwardImportCounts = new Map<string, number>();
  const serverInClientFiles = new Set<string>();

  for (const filePath of sourceFiles) {
    const content = await fs.readFile(filePath, 'utf8');
    const relativeFile = normalizePath(path.relative(srcDir, filePath));
    const currentFeature = getFeatureName(relativeFile);
    const currentLayer = getLayer(relativeFile);
    const currentRank = getLayerRank(currentLayer);
    const isClientFile = hasUseClientDirective(content);
    const imports = extractImports(content);

    for (const importSource of imports) {
      if (isClientFile && SERVER_PACKAGES.has(importSource)) {
        serverInClientFiles.add(relativeFile);
      }

      const resolved = resolveImportSource(importSource, filePath, srcDirName);
      if (!resolved) continue;

      const importedFeature = getFeatureName(resolved);
      if (currentFeature && importedFeature && currentFeature !== importedFeature) {
        const pair = `features/${currentFeature} → features/${importedFeature}`;
        crossFeatureCounts.set(pair, (crossFeatureCounts.get(pair) ?? 0) + 1);
      }

      if (resolved.startsWith('features/') && importedFeature) {
        const isIntraFeature = currentFeature === importedFeature;
        if (!isIntraFeature && !isFeaturePublicImport(resolved)) {
          const key = `${relativeFile}: ${importSource}`;
          deepImportCounts.set(key, (deepImportCounts.get(key) ?? 0) + 1);
        }
      }

      if (currentLayer !== null && currentRank !== null) {
        const importedLayer = getLayer(resolved);
        const importedRank = getLayerRank(importedLayer);
        if (importedLayer !== null && importedRank !== null && importedRank > currentRank) {
          const key = `${currentLayer} → ${importedLayer} (${importSource})`;
          upwardImportCounts.set(key, (upwardImportCounts.get(key) ?? 0) + 1);
        }
      }

      if (isClientFile) {
        if (isServerPath(resolved)) {
          serverInClientFiles.add(relativeFile);
        }

        const absolutePath = resolveAbsoluteImportPath(importSource, filePath, srcDirName);
        if (absolutePath) {
          const directives = readModuleDirectives(absolutePath);
          if (directives.server && !directives.client) {
            serverInClientFiles.add(relativeFile);
          }
        }
      }
    }
  }

  for (const [pair, count] of crossFeatureCounts) {
    issues.push({
      level: 'error',
      message: `${pair} import (${count} file${count === 1 ? '' : 's'}) — use shared/ or pass data via props (same as eslint no-cross-feature-imports)`,
    });
  }

  for (const [key] of deepImportCounts) {
    const [file, importSource] = key.split(': ');
    issues.push({
      level: 'error',
      message: `Deep feature import "${importSource}" — use @/features/<name> public API only (same as eslint no-deep-imports)`,
      file,
    });
  }

  for (const [key, count] of upwardImportCounts) {
    issues.push({
      level: 'error',
      message: `Upward layer import ${key} (${count} file${count === 1 ? '' : 's'}) — lower layers cannot import upper layers (same as eslint no-upward-imports)`,
    });
  }

  for (const file of serverInClientFiles) {
    issues.push({
      level: 'error',
      message: `'use client' file imports server-only code — move to actions/ or pass via props (same as eslint no-server-in-client)`,
      file,
    });
  }

  return issues;
}
