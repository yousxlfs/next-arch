import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PAGE_PRESET,
  PAGE_PRESET_LABELS,
  PAGE_PRESETS,
  type PagePreset,
} from '../src/lib/page-presets.js';

describe('page-presets metadata', () => {
  it('lists all supported presets', () => {
    expect(PAGE_PRESETS).toEqual(['auth', 'dashboard', 'crud', 'profile', 'settings', 'blank']);
  });

  it('defaults to blank preset', () => {
    expect(DEFAULT_PAGE_PRESET).toBe('blank');
  });

  it('has human-readable label for every preset', () => {
    for (const preset of PAGE_PRESETS) {
      expect(PAGE_PRESET_LABELS[preset as PagePreset]).toMatch(/\S/);
    }
  });
});
