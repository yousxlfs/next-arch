'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDemo } from '../api/fetchDemo';

export function useDemo() {
  return useQuery({
    queryKey: ['demo'],
    queryFn: fetchDemo,
  });
}
