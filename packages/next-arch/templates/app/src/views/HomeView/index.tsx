'use client';

import { FeatureDemo } from '@/features/demo';

export function HomeView() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Next Architecture
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          Профессиональная структура для Next.js 16
        </p>

        <FeatureDemo />
      </div>
    </main>
  );
}