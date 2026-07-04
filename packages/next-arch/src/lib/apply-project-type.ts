import fs from 'fs-extra';
import path from 'path';
import type { ProjectType } from './packages.js';

const STANDARD_PAGE = `// src/app/page.tsx
import { FeatureDemo } from '@/features/demo';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex flex-1 items-center justify-center p-8">
        <FeatureDemo />
      </section>
    </main>
  );
}
`;

export async function applyProjectType(targetDir: string, projectType: ProjectType): Promise<void> {
  if (projectType === 'full') {
    return;
  }

  const srcDir = path.join(targetDir, 'src');

  await fs.remove(path.join(srcDir, 'views'));
  await fs.remove(path.join(srcDir, 'widgets'));

  if (projectType === 'simple') {
    await fs.remove(path.join(srcDir, 'entities'));
  }

  await fs.writeFile(path.join(srcDir, 'app', 'page.tsx'), STANDARD_PAGE);
}
