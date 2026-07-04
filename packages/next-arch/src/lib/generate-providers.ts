import fs from 'fs-extra';
import path from 'path';
import type { InitSelections } from './packages.js';

export async function generateProviders(
  targetDir: string,
  selections: InitSelections,
): Promise<string> {
  const providersPath = path.join(targetDir, 'src', 'app', 'providers', 'index.tsx');

  const imports = ["import type { ReactNode } from 'react';"];
  imports.push("import { QueryProvider } from '@/shared/providers/QueryProvider';");

  const wrappers: string[] = [];
  const siblings: string[] = [];

  if (selections.stateManager === 'redux') {
    imports.push("import { ReduxProvider } from '@/shared/providers/ReduxProvider';");
    wrappers.push('ReduxProvider');
  }

  if (selections.stateManager === 'jotai') {
    imports.push("import { JotaiProvider } from '@/shared/providers/JotaiProvider';");
    wrappers.push('JotaiProvider');
  }

  if (selections.optionalPackages.includes('sonner')) {
    imports.push("import { SonnerToaster } from '@/shared/providers/SonnerToaster';");
    siblings.push('<SonnerToaster />');
  }

  let inner = '{children}';
  if (siblings.length > 0) {
    inner = `<>\n      ${siblings.join('\n      ')}\n      {children}\n    </>`;
  }

  for (const wrapper of [...wrappers].reverse()) {
    inner = `<${wrapper}>\n      ${inner}\n    </${wrapper}>`;
  }

  const content = `'use client';

/**
 * Провайдеры приложения — собраны автоматически при init.
 * Не редактируй вручную структуру обёрток; добавляй новые провайдеры через next-arch init
 * или вручную в shared/providers/ + сюда.
 */

${imports.join('\n')}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      ${inner}
    </QueryProvider>
  );
}
`;

  await fs.ensureDir(path.dirname(providersPath));
  await fs.writeFile(providersPath, content);

  return providersPath;
}
