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
        'Layer "{{currentLayer}}" cannot import from upper layer "{{importedLayer}}" ({{importSource}}). Move this code up the layer stack or expose data through props.',
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

    return visitImportSources(context, ({ reportNode, importSource }) => {
      const resolved = resolveImportSource(importSource, context.filename, srcDir);
      if (!resolved) return;

      const importedLayer = getLayer(resolved);
      const importedRank = getLayerRank(importedLayer);
      if (importedLayer === null || importedRank === null) return;

      if (importedRank > currentRank) {
        context.report({
          node: reportNode,
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
