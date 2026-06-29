import type { Rule } from 'eslint';
import { visitImportSources } from '../utils/import-visitors.js';
import {
  getLayer,
  getLayerRank,
  getSettings,
  getSrcRelativePath,
  resolveImportSource,
} from '../utils/layers.js';

export const noUpwardImports: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow imports from upper architectural layers into lower layers.',
    },
    messages: {
      upwardImport:
        'next-arch/no-upward-imports: Layer "{{currentLayer}}" cannot import from upper layer "{{importedLayer}}" ({{importSource}}).',
    },
    schema: [],
  },
  create(context) {
    const { srcDir } = getSettings(context);
    const currentFile = getSrcRelativePath(context.filename, srcDir);
    if (!currentFile) return {};

    const currentLayer = getLayer(currentFile);
    const currentRank = getLayerRank(currentLayer);
    if (currentLayer === null || currentRank === null) return {};

    return visitImportSources(context, (node, importSource) => {
      const resolved = resolveImportSource(importSource, context.filename, srcDir);
      if (!resolved) return;

      const importedLayer = getLayer(resolved);
      const importedRank = getLayerRank(importedLayer);
      if (importedLayer === null || importedRank === null) return;

      if (importedRank > currentRank) {
        context.report({
          node: node.source as Rule.Node,
          messageId: 'upwardImport',
          data: {
            currentLayer,
            importedLayer,
            importSource,
          },
        });
      }
    });
  },
};
