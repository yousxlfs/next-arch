export type StateManager = 'zustand' | 'redux' | 'jotai' | 'none';
export type FormLibrary = 'tanstack-form' | 'react-hook-form' | 'none';

export type OptionalPackage =
  | 'tanstack-table'
  | 'motion'
  | 'nuqs'
  | 'trpc'
  | 'better-auth'
  | 'uploadthing'
  | 'sonner'
  | 'next-intl'
  | 'sentry';

export interface InitSelections {
  stateManager: StateManager;
  formLibrary: FormLibrary;
  optionalPackages: OptionalPackage[];
  withExamples: boolean;
}

export const DEFAULT_INIT_SELECTIONS: InitSelections = {
  stateManager: 'zustand',
  formLibrary: 'tanstack-form',
  optionalPackages: ['tanstack-table'],
  withExamples: true,
};

export const PACKAGE_VERSIONS = {
  zustand: '^5.0.14',
  '@reduxjs/toolkit': '^2.8.2',
  'react-redux': '^9.2.0',
  jotai: '^2.12.5',
  '@tanstack/react-form': '^1.0.0',
  zod: '^4.4.3',
  'react-hook-form': '^7.56.4',
  '@hookform/resolvers': '^5.0.1',
  '@tanstack/react-query': '^5.101.2',
  '@tanstack/react-query-devtools': '^5.101.2',
  '@tanstack/react-table': '^8.21.3',
  motion: '^12.19.1',
  nuqs: '^2.4.3',
  '@trpc/client': '^11.1.2',
  '@trpc/server': '^11.1.2',
  '@trpc/react-query': '^11.1.2',
  'better-auth': '^1.2.8',
  uploadthing: '^7.7.2',
  '@uploadthing/react': '^7.3.1',
  sonner: '^2.0.3',
  'next-intl': '^4.1.0',
  '@sentry/nextjs': '^10.58.0',
} as const;

export interface ResolvedDependencies {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export function resolveDependencies(selections: InitSelections): ResolvedDependencies {
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};

  dependencies['@tanstack/react-query'] = PACKAGE_VERSIONS['@tanstack/react-query'];
  devDependencies['@tanstack/react-query-devtools'] =
    PACKAGE_VERSIONS['@tanstack/react-query-devtools'];

  dependencies.zod = PACKAGE_VERSIONS.zod;

  switch (selections.stateManager) {
    case 'zustand':
      dependencies.zustand = PACKAGE_VERSIONS.zustand;
      break;
    case 'redux':
      dependencies['@reduxjs/toolkit'] = PACKAGE_VERSIONS['@reduxjs/toolkit'];
      dependencies['react-redux'] = PACKAGE_VERSIONS['react-redux'];
      break;
    case 'jotai':
      dependencies.jotai = PACKAGE_VERSIONS.jotai;
      break;
    case 'none':
      break;
  }

  switch (selections.formLibrary) {
    case 'tanstack-form':
      dependencies['@tanstack/react-form'] = PACKAGE_VERSIONS['@tanstack/react-form'];
      break;
    case 'react-hook-form':
      dependencies['react-hook-form'] = PACKAGE_VERSIONS['react-hook-form'];
      dependencies['@hookform/resolvers'] = PACKAGE_VERSIONS['@hookform/resolvers'];
      break;
    case 'none':
      break;
  }

  for (const pkg of selections.optionalPackages) {
    switch (pkg) {
      case 'tanstack-table':
        dependencies['@tanstack/react-table'] = PACKAGE_VERSIONS['@tanstack/react-table'];
        break;
      case 'motion':
        dependencies.motion = PACKAGE_VERSIONS.motion;
        break;
      case 'nuqs':
        dependencies.nuqs = PACKAGE_VERSIONS.nuqs;
        break;
      case 'trpc':
        dependencies['@trpc/client'] = PACKAGE_VERSIONS['@trpc/client'];
        dependencies['@trpc/server'] = PACKAGE_VERSIONS['@trpc/server'];
        dependencies['@trpc/react-query'] = PACKAGE_VERSIONS['@trpc/react-query'];
        break;
      case 'better-auth':
        dependencies['better-auth'] = PACKAGE_VERSIONS['better-auth'];
        break;
      case 'uploadthing':
        dependencies.uploadthing = PACKAGE_VERSIONS.uploadthing;
        dependencies['@uploadthing/react'] = PACKAGE_VERSIONS['@uploadthing/react'];
        break;
      case 'sonner':
        dependencies.sonner = PACKAGE_VERSIONS.sonner;
        break;
      case 'next-intl':
        dependencies['next-intl'] = PACKAGE_VERSIONS['next-intl'];
        break;
      case 'sentry':
        dependencies['@sentry/nextjs'] = PACKAGE_VERSIONS['@sentry/nextjs'];
        break;
    }
  }

  return { dependencies, devDependencies };
}

/** Package template folders to apply (relative to templates/packages/). */
export function getPackageTemplates(selections: InitSelections): string[] {
  const templates = new Set<string>(['tanstack-query', 'env']);

  switch (selections.stateManager) {
    case 'zustand':
      templates.add('zustand');
      break;
    case 'redux':
      templates.add('redux');
      break;
    case 'jotai':
      templates.add('jotai');
      break;
    case 'none':
      break;
  }

  switch (selections.formLibrary) {
    case 'tanstack-form':
      templates.add('tanstack-form');
      break;
    case 'react-hook-form':
      templates.add('react-hook-form');
      break;
    case 'none':
      break;
  }

  for (const pkg of selections.optionalPackages) {
    templates.add(pkg);
  }

  if (selections.optionalPackages.includes('sonner')) {
    templates.add('sonner-provider');
  }

  return [...templates];
}

export function formatSelectionsSummary(selections: InitSelections): string[] {
  const lines: string[] = [];

  const stateLabels: Record<StateManager, string> = {
    zustand: 'Zustand',
    redux: 'Redux Toolkit',
    jotai: 'Jotai',
    none: 'None',
  };

  const formLabels: Record<FormLibrary, string> = {
    'tanstack-form': 'TanStack Form + zod',
    'react-hook-form': 'React Hook Form + zod',
    none: 'None',
  };

  lines.push(`State: ${stateLabels[selections.stateManager]}`);
  lines.push(`Forms: ${formLabels[selections.formLibrary]}`);
  lines.push('Always: TanStack Query + Devtools');

  const optionalLabels: Record<OptionalPackage, string> = {
    'tanstack-table': 'TanStack Table',
    motion: 'Motion',
    nuqs: 'nuqs',
    trpc: 'tRPC',
    'better-auth': 'Better Auth',
    uploadthing: 'Uploadthing',
    sonner: 'Sonner',
    'next-intl': 'next-intl',
    'sentry': 'Sentry',
  };

  if (selections.optionalPackages.length > 0) {
    lines.push(
      `Optional: ${selections.optionalPackages.map((p) => optionalLabels[p]).join(', ')}`,
    );
  } else {
    lines.push('Optional: none');
  }

  lines.push(`Examples: ${selections.withExamples ? 'yes' : 'no'}`);

  return lines;
}
