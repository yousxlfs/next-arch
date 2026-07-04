import { describe, expect, it } from 'vitest';
import { assertValidSliceName, toKebabCase, toPascalCase } from '../src/lib/naming.js';
import { buildReplacements } from '../src/lib/template.js';

describe('naming helpers', () => {
  describe('toPascalCase', () => {
    it('converts kebab-case', () => {
      expect(toPascalCase('user-profile')).toBe('UserProfile');
    });

    it('converts snake_case', () => {
      expect(toPascalCase('order_items')).toBe('OrderItems');
    });

    it('handles single word', () => {
      expect(toPascalCase('orders')).toBe('Orders');
    });

    it('handles already PascalCase segments', () => {
      expect(toPascalCase('siteHeader')).toBe('SiteHeader');
    });
  });

  describe('toKebabCase', () => {
    it('converts PascalCase', () => {
      expect(toKebabCase('UserProfile')).toBe('user-profile');
    });

    it('converts spaces and underscores', () => {
      expect(toKebabCase('order_items')).toBe('order-items');
    });

    it('lowercases simple names', () => {
      expect(toKebabCase('Orders')).toBe('orders');
    });
  });

  describe('assertValidSliceName', () => {
    it('accepts valid names', () => {
      expect(() => assertValidSliceName('payments')).not.toThrow();
      expect(() => assertValidSliceName('user-profile')).not.toThrow();
      expect(() => assertValidSliceName('Order_v2')).not.toThrow();
    });

    it('rejects invalid names', () => {
      expect(() => assertValidSliceName('')).toThrow();
      expect(() => assertValidSliceName('9payments')).toThrow();
      expect(() => assertValidSliceName('bad name')).toThrow();
      expect(() => assertValidSliceName('../hack')).toThrow();
    });
  });
});

describe('buildReplacements integration', () => {
  it('produces stable keys for crud page names', () => {
    const r = buildReplacements('orders', 'Orders', 'orders');
    expect(r['{{Name}}']).toBe('Orders');
    expect(r['{{name}}']).toBe('orders');
  });
});
