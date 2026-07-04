import type { Rule } from 'eslint';

export type ImportSourceRef = {
  reportNode: Rule.Node;
  importSource: string;
};

export function visitImportSources(
  context: Rule.RuleContext,
  onImport: (ref: ImportSourceRef) => void,
): Rule.RuleListener {
  return {
    ImportDeclaration(node) {
      const importNode = node as { source: { value: string } };
      onImport({
        reportNode: (node as { source: Rule.Node }).source,
        importSource: String(importNode.source.value),
      });
    },
    ExportNamedDeclaration(node) {
      const exportNode = node as { source?: { value: string } | null };
      if (exportNode.source?.value) {
        onImport({
          reportNode: exportNode.source as unknown as Rule.Node,
          importSource: String(exportNode.source.value),
        });
      }
    },
    ExportAllDeclaration(node) {
      const exportNode = node as { source: { value: string } };
      onImport({
        reportNode: exportNode.source as unknown as Rule.Node,
        importSource: String(exportNode.source.value),
      });
    },
    ImportExpression(node) {
      const expression = node as { source: { type: string; value?: string } };
      if (expression.source.type === 'Literal' && typeof expression.source.value === 'string') {
        onImport({
          reportNode: expression.source as unknown as Rule.Node,
          importSource: expression.source.value,
        });
      }
    },
    CallExpression(node) {
      const call = node as {
        callee: { type: string; name?: string };
        arguments: Array<{ type: string; value?: string } & Rule.Node>;
      };

      if (
        call.callee.type === 'Identifier' &&
        call.callee.name === 'require' &&
        call.arguments[0]?.type === 'Literal' &&
        typeof call.arguments[0].value === 'string'
      ) {
        onImport({
          reportNode: call.arguments[0],
          importSource: call.arguments[0].value,
        });
      }
    },
  };
}

export function hasUseClientDirective(context: Rule.RuleContext): boolean {
  const program = context.getSourceCode().ast;
  const body = (program as { body?: Array<{ type: string; value?: string }> }).body ?? [];

  return body.some((statement) => {
    if (statement.type !== 'ExpressionStatement') return false;
    const expressionStatement = statement as {
      directive?: string;
      expression?: { type: string; value?: string };
    };
    return (
      expressionStatement.directive === 'use client' ||
      (expressionStatement.expression?.type === 'Literal' &&
        expressionStatement.expression.value === 'use client')
    );
  });
}
