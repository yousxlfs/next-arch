import { describe, expect, it } from 'vitest';
import { buildReplacements } from '../src/lib/template.js';
import {
  DEFAULT_INIT_SELECTIONS,
  PACKAGE_VERSIONS,
  formatSelectionsSummary,
  getPackageTemplates,
  isProjectType,
  resolveBaseDependencies,
  resolveDependencies,
} from '../src/lib/packages.js';

describe('packages.ts', () => {
  it('isProjectType validates known types', () => {
    expect(isProjectType('full')).toBe(true);
    expect(isProjectType('standard')).toBe(true);
    expect(isProjectType('simple')).toBe(true);
    expect(isProjectType('invalid')).toBe(false);
  });

  it('resolveBaseDependencies pins next and react without carets', () => {
    const base = resolveBaseDependencies();
    expect(base.dependencies.next).toBe(PACKAGE_VERSIONS.next);
    expect(base.dependencies.next).not.toMatch(/[\^~]/);
    expect(base.devDependencies.typescript).toBe(PACKAGE_VERSIONS.typescript);
  });

  it('resolveDependencies adds zustand when selected', () => {
    const deps = resolveDependencies({
      ...DEFAULT_INIT_SELECTIONS,
      stateManager: 'zustand',
      optionalPackages: [],
    });
    expect(deps.dependencies.zustand).toBe(PACKAGE_VERSIONS.zustand);
  });

  it('resolveDependencies adds redux stack when selected', () => {
    const deps = resolveDependencies({
      ...DEFAULT_INIT_SELECTIONS,
      stateManager: 'redux',
      optionalPackages: [],
    });
    expect(deps.dependencies['@reduxjs/toolkit']).toBeDefined();
    expect(deps.dependencies['react-redux']).toBeDefined();
  });

  it('resolveDependencies adds jotai when selected', () => {
    const deps = resolveDependencies({
      ...DEFAULT_INIT_SELECTIONS,
      stateManager: 'jotai',
      optionalPackages: [],
    });
    expect(deps.dependencies.jotai).toBe(PACKAGE_VERSIONS.jotai);
  });

  it('resolveDependencies adds react-hook-form stack when selected', () => {
    const deps = resolveDependencies({
      ...DEFAULT_INIT_SELECTIONS,
      formLibrary: 'react-hook-form',
      optionalPackages: [],
    });
    expect(deps.dependencies['react-hook-form']).toBe(PACKAGE_VERSIONS['react-hook-form']);
    expect(deps.dependencies['@hookform/resolvers']).toBeDefined();
  });

  it('resolveDependencies always includes tanstack query and zod', () => {
    const deps = resolveDependencies({
      ...DEFAULT_INIT_SELECTIONS,
      stateManager: 'none',
      formLibrary: 'none',
      optionalPackages: [],
    });
    expect(deps.dependencies['@tanstack/react-query']).toBeDefined();
    expect(deps.dependencies.zod).toBeDefined();
    expect(deps.devDependencies['@tanstack/react-query-devtools']).toBeDefined();
  });

  it.each([
    ['motion', 'motion'],
    ['nuqs', 'nuqs'],
    ['trpc', '@trpc/client'],
    ['better-auth', 'better-auth'],
    ['uploadthing', 'uploadthing'],
    ['sonner', 'sonner'],
    ['next-intl', 'next-intl'],
    ['sentry', '@sentry/nextjs'],
  ] as const)('resolveDependencies adds optional package %s', (optional, depKey) => {
    const deps = resolveDependencies({
      ...DEFAULT_INIT_SELECTIONS,
      optionalPackages: [optional],
    });
    expect(deps.dependencies[depKey]).toBeDefined();
  });

  it('getPackageTemplates includes tanstack-query and env always', () => {
    const templates = getPackageTemplates({
      ...DEFAULT_INIT_SELECTIONS,
      stateManager: 'none',
      formLibrary: 'none',
      optionalPackages: [],
    });
    expect(templates).toContain('tanstack-query');
    expect(templates).toContain('env');
  });

  it('getPackageTemplates adds redux and jotai templates', () => {
    expect(
      getPackageTemplates({ ...DEFAULT_INIT_SELECTIONS, stateManager: 'redux', optionalPackages: [] }),
    ).toContain('redux');
    expect(
      getPackageTemplates({ ...DEFAULT_INIT_SELECTIONS, stateManager: 'jotai', optionalPackages: [] }),
    ).toContain('jotai');
  });

  it('getPackageTemplates adds form library templates', () => {
    expect(
      getPackageTemplates({
        ...DEFAULT_INIT_SELECTIONS,
        formLibrary: 'react-hook-form',
        optionalPackages: [],
      }),
    ).toContain('react-hook-form');
  });

  it('getPackageTemplates adds sonner-provider when sonner selected', () => {
    const templates = getPackageTemplates({
      ...DEFAULT_INIT_SELECTIONS,
      optionalPackages: ['sonner'],
    });
    expect(templates).toContain('sonner');
    expect(templates).toContain('sonner-provider');
  });

  it('formatSelectionsSummary renders readable init summary', () => {
    const lines = formatSelectionsSummary({
      projectType: 'simple',
      stateManager: 'zustand',
      formLibrary: 'tanstack-form',
      optionalPackages: ['sonner'],
      withExamples: false,
    });

    expect(lines.join('\n')).toContain('Simple (features + shared)');
    expect(lines.join('\n')).toContain('Zustand');
    expect(lines.join('\n')).toContain('Sonner');
    expect(lines.join('\n')).toContain('Examples: no');
  });

  it('formatSelectionsSummary shows optional none when empty', () => {
    const lines = formatSelectionsSummary({
      ...DEFAULT_INIT_SELECTIONS,
      optionalPackages: [],
    });
    expect(lines.some((line) => line.includes('Optional: none'))).toBe(true);
  });
});

describe('template buildReplacements', () => {
  it('replaces all placeholders', () => {
    const r = buildReplacements('orders', 'Orders', 'orders');
    expect(r['{{Name}}']).toBe('Orders');
    expect(r['{{name}}']).toBe('orders');
    expect(r['{{NAME}}']).toBe('ORDERS');
  });
});
