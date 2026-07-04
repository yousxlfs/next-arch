'use client';

import type { ReactNode } from 'react';
import { QueryProvider } from '@/shared/providers/QueryProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
