export type PackageManager = 'pnpm' | 'yarn' | 'npm';

export function detectPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent ?? '';
  if (userAgent.includes('pnpm')) return 'pnpm';
  if (userAgent.includes('yarn')) return 'yarn';
  return 'npm';
}

export function installCommand(pm: PackageManager): string {
  return `${pm} install`;
}

export function devCommand(pm: PackageManager): string {
  return `${pm} run dev`;
}
