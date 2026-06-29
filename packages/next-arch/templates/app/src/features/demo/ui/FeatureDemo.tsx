'use client';

import { Button } from '@/shared/ui';
import { useState } from 'react';

export function FeatureDemo() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-6 border rounded-xl bg-card">
      <h2 className="text-2xl font-semibold mb-4">Demo Feature</h2>
      <p className="mb-4">Счётчик: {count}</p>
      <Button onClick={() => setCount(count + 1)}>
        Увеличить
      </Button>
    </div>
  );
}
