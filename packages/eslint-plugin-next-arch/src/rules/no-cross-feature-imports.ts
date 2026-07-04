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
        'Cannot import from feature "{{imported}}" inside feature "{{current}}". Move shared logic to shared/ or pass data via props from a parent layer.',
    },
    schema: [],
  },
  create(context) {
    const { srcDir } = getSettings(context);
    const currentFile = getSrcRelativePath(context.filename, srcDir);
    if (!currentFile) return {};

    const currentFeature = getFeatureName(currentFile);
    if (!currentFeature) return {};

    return visitImportSources(context, ({ reportNode, importSource }) => {
      const resolved = resolveImportSource(importSource, context.filename, srcDir);
      if (!resolved) return;

      const importedFeature = getFeatureName(resolved);
      if (!importedFeature || importedFeature === currentFeature) return;

      context.report({
        node: reportNode,
        messageId: 'crossFeature',
        data: {
          current: currentFeature,
          imported: importedFeature,
        },
      });
    });
  },
};
