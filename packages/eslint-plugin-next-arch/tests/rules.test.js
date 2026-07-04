import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RuleTester } from 'eslint';
import plugin from '../dist/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.join(__dirname, 'fixtures', 'project', 'src');

function fixture(relativePath) {
  return path.join(fixturesRoot, relativePath);
}

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
});

const rules = plugin.rules;

ruleTester.run('no-cross-feature-imports', rules['no-cross-feature-imports'], {
  valid: [
    {
      code: "import { useUser } from '@/shared/lib/useUser'",
      filename: fixture('features/cart/ui/CartButton.tsx'),
    },
    {
      code: "import { useCart } from '../hooks/useCart'",
      filename: fixture('features/cart/ui/CartButton.tsx'),
    },
  ],
  invalid: [
    {
      code: "import { useUser } from '../../auth/hooks/useUser'",
      filename: fixture('features/cart/ui/CartButton.tsx'),
      errors: [{ messageId: 'crossFeature' }],
    },
    {
      code: "import { useUser } from '@/features/auth/hooks/useUser'",
      filename: fixture('features/cart/ui/CartButton.tsx'),
      errors: [{ messageId: 'crossFeature' }],
    },
    {
      code: "export { useUser } from '@/features/auth/hooks/useUser'",
      filename: fixture('features/cart/index.ts'),
      errors: [{ messageId: 'crossFeature' }],
    },
    {
      code: "const auth = require('../../auth/hooks/useUser')",
      filename: fixture('features/cart/ui/CartButton.tsx'),
      errors: [{ messageId: 'crossFeature' }],
    },
    {
      code: "export * from '@/features/auth'",
      filename: fixture('features/cart/index.ts'),
      errors: [{ messageId: 'crossFeature' }],
    },
  ],
});

ruleTester.run('no-deep-imports', rules['no-deep-imports'], {
  valid: [
    {
      code: "import { Cart } from '@/features/cart'",
      filename: fixture('views/HomeView/index.tsx'),
    },
    {
      code: "import { useCart } from '../hooks/useCart'",
      filename: fixture('features/cart/ui/CartButton.tsx'),
    },
  ],
  invalid: [
    {
      code: "import { CartButton } from '@/features/cart/ui/CartButton'",
      filename: fixture('views/HomeView/index.tsx'),
      errors: [{ messageId: 'deepImport' }],
    },
  ],
});

ruleTester.run('no-server-in-client', rules['no-server-in-client'], {
  valid: [
    {
      code: "import { cn } from '@/shared/lib/utils'",
      filename: fixture('features/cart/ui/CartButton.tsx'),
    },
  ],
  invalid: [
    {
      code: "'use client';\nimport { cookies } from 'next/headers';",
      filename: fixture('features/cart/ui/CartButton.tsx'),
      errors: [{ messageId: 'serverPackage' }],
    },
    {
      code: "'use client';\nimport { save } from '@/features/cart/server/actions';",
      filename: fixture('features/cart/ui/CartButton.tsx'),
      errors: [{ messageId: 'serverPath' }],
    },
    {
      code: "'use client';\nimport { save } from '@/features/cart/actions/save';",
      filename: fixture('features/cart/ui/CartButton.tsx'),
      errors: [{ messageId: 'serverModule' }],
    },
  ],
});

ruleTester.run('no-upward-imports', rules['no-upward-imports'], {
  valid: [
    {
      code: "import { cn } from '@/shared/lib/utils'",
      filename: fixture('features/cart/ui/CartButton.tsx'),
    },
    {
      code: "import { User } from '@/entities/user'",
      filename: fixture('features/cart/ui/CartButton.tsx'),
    },
    {
      code: "import { Cart } from '@/features/cart'",
      filename: fixture('middleware.ts'),
    },
  ],
  invalid: [
    {
      code: "import { Cart } from '@/features/cart'",
      filename: fixture('shared/lib/utils.ts'),
      errors: [{ messageId: 'upwardImport' }],
    },
    {
      code: "import { HomeView } from '@/views/HomeView'",
      filename: fixture('features/cart/ui/CartButton.tsx'),
      errors: [{ messageId: 'upwardImport' }],
    },
    {
      code: "import { authConfig } from '@/middleware'",
      filename: fixture('views/HomeView/index.tsx'),
      errors: [{ messageId: 'upwardImport' }],
    },
  ],
});

assert.match(
  readFileSync(path.join(__dirname, '../dist/index.js'), 'utf8'),
  /no-cross-feature-imports/,
);

const pkg = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
assert.equal(plugin.meta.version, pkg.version);

console.log('eslint-plugin-next-arch: all rule tests passed');
