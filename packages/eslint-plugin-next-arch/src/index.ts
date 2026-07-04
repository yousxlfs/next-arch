import type { ESLint, Linter } from 'eslint';
import { createRequire } from 'node:module';
import { noCrossFeatureImports } from './rules/no-cross-feature-imports.js';
import { noDeepImports } from './rules/no-deep-imports.js';
import { noServerInClient } from './rules/no-server-in-client.js';
import { noUpwardImports } from './rules/no-upward-imports.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

const plugin = {
  meta: {
    name: 'eslint-plugin-next-arch',
    version,
  },
  rules: {
    'no-cross-feature-imports': noCrossFeatureImports,
    'no-deep-imports': noDeepImports,
    'no-server-in-client': noServerInClient,
    'no-upward-imports': noUpwardImports,
  },
} satisfies ESLint.Plugin;

export default plugin;

export const configs = {
  recommended: {
    plugins: {
      'next-arch': plugin,
    },
    settings: {
      'next-arch': {
        srcDir: 'src',
      },
    },
    rules: {
      'next-arch/no-cross-feature-imports': 'error',
      'next-arch/no-deep-imports': 'error',
      'next-arch/no-server-in-client': 'error',
      'next-arch/no-upward-imports': 'error',
    },
  } satisfies Linter.Config,
};

export {
  noCrossFeatureImports,
  noDeepImports,
  noServerInClient,
  noUpwardImports,
};

export {
  getFeatureName,
  getLayer,
  getLayerRank,
  getProjectRoot,
  getSrcRelativePath,
  isFeaturePublicImport,
  isServerPackage,
  isServerPath,
  normalizePath,
  readModuleDirectives,
  resolveAbsoluteImportPath,
  resolveImportSource,
} from './utils/layers.js';
