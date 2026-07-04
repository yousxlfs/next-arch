import { afterEach, describe, expect, it } from 'vitest';
import {
  detectPackageManager,
  devCommand,
  installCommand,
} from '../src/lib/detect-package-manager.js';

describe('detectPackageManager', () => {
  const originalUserAgent = process.env.npm_config_user_agent;

  afterEach(() => {
    if (originalUserAgent === undefined) {
      delete process.env.npm_config_user_agent;
    } else {
      process.env.npm_config_user_agent = originalUserAgent;
    }
  });

  it('detects pnpm from npm_config_user_agent', () => {
    process.env.npm_config_user_agent = 'pnpm/9.15.0 npm/? node/v20.0.0';
    expect(detectPackageManager()).toBe('pnpm');
    expect(installCommand('pnpm')).toBe('pnpm install');
    expect(devCommand('pnpm')).toBe('pnpm run dev');
  });

  it('detects yarn from npm_config_user_agent', () => {
    process.env.npm_config_user_agent = 'yarn/1.22.22 npm/? node/v20.0.0';
    expect(detectPackageManager()).toBe('yarn');
  });

  it('falls back to npm', () => {
    delete process.env.npm_config_user_agent;
    expect(detectPackageManager()).toBe('npm');
    expect(installCommand('npm')).toBe('npm install');
  });
});
