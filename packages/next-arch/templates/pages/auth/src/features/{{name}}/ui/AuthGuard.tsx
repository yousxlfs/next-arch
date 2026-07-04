'use client';

import type { ReactNode } from 'react';
import { useSession } from '../hooks/use-session';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback = <p>Требуется авторизация</p> }: AuthGuardProps) {
  const { isAuthenticated } = useSession();
  return isAuthenticated ? children : fallback;
}
