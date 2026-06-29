import type { Rule } from 'eslint';

type ImportNode = {
  source: { value: string };
};

export function visitImportSources(
  context: Rule.RuleContext,
  onImport: (node: ImportNode, importSource: string) => void,
): Rule.RuleListener {
  return {
    ImportDeclaration(node) {
      onImport(node as ImportNode, String((node as ImportNode).source.value));
    },
    ExportNamedDeclaration(node) {
      const exportNode = node as ImportNode & { source?: { value: string } | null };
      if (exportNode.source?.value) {
        onImport(exportNode, String(exportNode.source.value));
      }
    },
    ExportAllDeclaration(node) {
      const exportNode = node as ImportNode;
      onImport(exportNode, String(exportNode.source.value));
    },
    ImportExpression(node) {
      const expression = node as { source: { type: string; value?: string } };
      if (expression.source.type === 'Literal' && typeof expression.source.value === 'string') {
        onImport(expression as unknown as ImportNode, expression.source.value);
      }
    },
    CallExpression(node) {
      const call = node as {
        callee: { type: string; name?: string };
        arguments: Array<{ type: string; value?: string }>;
      };

      if (
        call.callee.type === 'Identifier' &&
        call.callee.name === 'require' &&
        call.arguments[0]?.type === 'Literal' &&
        typeof call.arguments[0].value === 'string'
      ) {
        onImport(call as unknown as ImportNode, call.arguments[0].value);
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
