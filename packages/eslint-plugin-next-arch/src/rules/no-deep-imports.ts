import type { Rule } from 'eslint';
import { visitImportSources } from '../utils/import-visitors.js';
import {
  getFeatureName,
  getSettings,
  getSrcRelativePath,
  isFeaturePublicImport,
  resolveImportSource,
} from '../utils/layers.js';

export const noDeepImports: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow deep imports into features. Import only through the feature public index.',
    },
    messages: {
      deepImport:
        'Import feature "{{feature}}" only through its public API: `import { … } from \'@/features/{{feature}}\'`. Do not use "{{importSource}}".',
    },
    schema: [],
  },
  create(context) {
    const { srcDir } = getSettings(context);
    const currentFile = getSrcRelativePath(context.filename, srcDir);
    if (!currentFile) return {};

    const currentFeature = getFeatureName(currentFile);

    return visitImportSources(context, ({ reportNode, importSource }) => {
      const resolved = resolveImportSource(importSource, context.filename, srcDir);
      if (!resolved?.startsWith('features/')) return;

      const importedFeature = getFeatureName(resolved);
      if (!importedFeature) return;

      if (currentFeature === importedFeature) return;
      if (isFeaturePublicImport(resolved)) return;

      context.report({
        node: reportNode,
        messageId: 'deepImport',
        data: {
          feature: importedFeature,
          importSource,
        },
      });
    });
  },
};
