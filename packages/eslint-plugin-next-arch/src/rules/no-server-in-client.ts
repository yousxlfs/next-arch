import type { Rule } from 'eslint';
import { hasUseClientDirective, visitImportSources } from '../utils/import-visitors.js';
import {
  getSettings,
  isServerPackage,
  isServerPath,
  readModuleDirectives,
  resolveAbsoluteImportPath,
  resolveImportSource,
} from '../utils/layers.js';

export const noServerInClient: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Disallow importing server-only code into files marked with 'use client'.",
    },
    messages: {
      serverPackage:
        "Client components cannot import server package '{{importSource}}'. Use a Server Component parent or pass data via props.",
      serverPath:
        "Client components cannot import server path '{{importSource}}'. Move logic to actions/ or a Server Component.",
      serverModule:
        "Client components cannot import '{{importSource}}' — it contains 'use server'. Pass the action via props from a Server Component.",
    },
    schema: [],
  },
  create(context) {
    const { srcDir } = getSettings(context);
    return visitImportSources(context, ({ reportNode, importSource }) => {
      if (!hasUseClientDirective(context)) return;

      if (isServerPackage(importSource)) {
        context.report({
          node: reportNode,
          messageId: 'serverPackage',
          data: { importSource },
        });
        return;
      }

      const resolved = resolveImportSource(importSource, context.filename, srcDir);
      if (resolved && isServerPath(resolved)) {
        context.report({
          node: reportNode,
          messageId: 'serverPath',
          data: { importSource },
        });
        return;
      }

      const absolutePath = resolveAbsoluteImportPath(
        importSource,
        context.filename,
        srcDir,
      );
      if (!absolutePath) return;

      const directives = readModuleDirectives(absolutePath);
      if (directives.server && !directives.client) {
        context.report({
          node: reportNode,
          messageId: 'serverModule',
          data: { importSource },
        });
      }
    });
  },
};
