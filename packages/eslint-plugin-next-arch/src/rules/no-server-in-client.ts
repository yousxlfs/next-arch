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
        "next-arch/no-server-in-client: Client components cannot import server package '{{importSource}}'.",
      serverPath:
        "next-arch/no-server-in-client: Client components cannot import server path '{{importSource}}'.",
      serverModule:
        "next-arch/no-server-in-client: Client components cannot import module with 'use server' ({{importSource}}).",
    },
    schema: [],
  },
  create(context) {
    const { srcDir } = getSettings(context);
    return visitImportSources(context, (node, importSource) => {
      if (!hasUseClientDirective(context)) return;

      if (isServerPackage(importSource)) {
        context.report({
          node: node.source as Rule.Node,
          messageId: 'serverPackage',
          data: { importSource },
        });
        return;
      }

      const resolved = resolveImportSource(importSource, context.filename, srcDir);
      if (resolved && isServerPath(resolved)) {
        context.report({
          node: node.source as Rule.Node,
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
          node: node.source as Rule.Node,
          messageId: 'serverModule',
          data: { importSource },
        });
      }
    });
  },
};
