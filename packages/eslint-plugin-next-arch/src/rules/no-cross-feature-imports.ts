import type { Rule } from 'eslint';
import { visitImportSources } from '../utils/import-visitors.js';
import {
  getFeatureName,
  getSettings,
  getSrcRelativePath,
  resolveImportSource,
} from '../utils/layers.js';

export const noCrossFeatureImports: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow direct imports between different features. Use shared/ or pass data through props.',
    },
    messages: {
      crossFeature:
        'next-arch/no-cross-feature-imports: Cannot import from feature "{{imported}}" inside feature "{{current}}". Use shared/ or pass data through props.',
    },
    schema: [],
  },
  create(context) {
    const { srcDir } = getSettings(context);
    const currentFile = getSrcRelativePath(context.filename, srcDir);
    if (!currentFile) return {};

    const currentFeature = getFeatureName(currentFile);
    if (!currentFeature) return {};

    return visitImportSources(context, (node, importSource) => {
      const resolved = resolveImportSource(importSource, context.filename, srcDir);
      if (!resolved) return;

      const importedFeature = getFeatureName(resolved);
      if (!importedFeature || importedFeature === currentFeature) return;

      context.report({
        node: node.source as Rule.Node,
        messageId: 'crossFeature',
        data: {
          current: currentFeature,
          imported: importedFeature,
        },
      });
    });
  },
};
