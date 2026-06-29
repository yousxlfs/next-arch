import fs from 'node:fs';
import path from 'node:path';

export const LAYERS = [
  'shared',
  'entities',
  'features',
  'widgets',
  'views',
  'app',
] as const;

export type Layer = (typeof LAYERS)[number];

const LAYER_RANK: Record<Layer, number> = {
  shared: 0,
  entities: 1,
  features: 2,
  widgets: 3,
  views: 4,
  app: 5,
};

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

export interface PluginSettings {
  srcDir: string;
}

export function normalizePath(value: string): string {
  return value.replace(/\\/g, '/');
}

export function getSettings(context: { settings?: Record<string, unknown> }): PluginSettings {
  const settings = context.settings?.['next-arch'] as Partial<PluginSettings> | undefined;
  return {
    srcDir: settings?.srcDir ?? 'src',
  };
}

export function getProjectRoot(filename: string, srcDir: string): string | null {
  const normalized = normalizePath(filename);
  const marker = `/${srcDir}/`;
  const index = normalized.lastIndexOf(marker);
  if (index === -1) return null;
  return normalized.slice(0, index);
}

export function getSrcRelativePath(filename: string, srcDir: string): string | null {
  const normalized = normalizePath(filename);
  const marker = `/${srcDir}/`;
  const index = normalized.indexOf(marker);
  if (index === -1) return null;
  return normalized.slice(index + marker.length);
}

export function getLayer(relativePath: string): Layer | null {
  const [first] = relativePath.split('/');
  if ((LAYERS as readonly string[]).includes(first)) {
    return first as Layer;
  }
  if (first === 'components' || first === 'lib') {
    return 'shared';
  }
  return null;
}

export function getLayerRank(layer: Layer | null): number | null {
  if (!layer) return null;
  return LAYER_RANK[layer];
}

export function getFeatureName(relativePath: string): string | null {
  const match = relativePath.match(/^features\/([^/]+)/);
  return match?.[1] ?? null;
}

export function resolveImportSource(
  importSource: string,
  currentFile: string,
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

  const projectRoot = getProjectRoot(currentFile, srcDir);
  if (!projectRoot) return null;

  const srcRoot = path.join(projectRoot, srcDir);
  const resolved = normalizePath(path.resolve(path.dirname(currentFile), importSource));
  const srcRootNormalized = normalizePath(srcRoot);

  if (!resolved.startsWith(srcRootNormalized)) {
    return null;
  }

  return resolved.slice(srcRootNormalized.length + 1);
}

export function isServerPackage(importSource: string): boolean {
  return SERVER_PACKAGES.has(importSource);
}

export function isServerPath(relativePath: string): boolean {
  return (
    relativePath.includes('/server/') ||
    /\.server(?:\.tsx?)?$/.test(relativePath)
  );
}

export function readModuleDirectives(
  absolutePath: string,
): { client: boolean; server: boolean } {
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

export function resolveAbsoluteImportPath(
  importSource: string,
  currentFile: string,
  srcDir: string,
): string | null {
  const relative = resolveImportSource(importSource, currentFile, srcDir);
  if (!relative) return null;

  const projectRoot = getProjectRoot(currentFile, srcDir);
  if (!projectRoot) return null;

  return path.join(projectRoot, srcDir, relative);
}

export function isFeaturePublicImport(relativePath: string): boolean {
  const parts = relativePath.split('/');
  if (parts[0] !== 'features' || parts.length < 2) {
    return false;
  }

  return parts.length === 2 || (parts.length === 3 && parts[2] === 'index');
}
