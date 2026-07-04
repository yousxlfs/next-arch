'use client';

import { useQuery } from '@tanstack/react-query';

export function use{{Name}}ListQuery() {
  return useQuery({
    queryKey: ['{{name}}'],
    queryFn: async () => [{ id: '1', title: 'Demo' }],
  });
}
