import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getFeatureName,
  getLayer,
  getLayerRank,
  getProjectRoot,
  getSrcRelativePath,
  isFeaturePublicImport,
  isServerPackage,
  isServerPath,
  normalizePath,
  readModuleDirectives,
  resolveAbsoluteImportPath,
  resolveImportSource,
} from '../dist/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.join(__dirname, 'fixtures', 'project');
const cartUi = path.join(fixturesRoot, 'src/features/cart/ui/CartButton.tsx');
const saveAction = path.join(fixturesRoot, 'src/features/cart/actions/save.ts');

assert.equal(normalizePath('src\\features\\cart'), 'src/features/cart');

assert.equal(getLayer('features/cart/ui/Button.tsx'), 'features');
assert.equal(getLayer('entities/user/model/types.ts'), 'entities');
assert.equal(getLayer('widgets/header/ui/Header.tsx'), 'widgets');
assert.equal(getLayer('views/HomeView/index.tsx'), 'views');
assert.equal(getLayer('shared/lib/utils.ts'), 'shared');
assert.equal(getLayer('app/page.tsx'), 'app');
assert.equal(getLayer('middleware.ts'), 'app');
assert.equal(getLayer('instrumentation.ts'), 'app');
assert.equal(getLayer('components/Button.tsx'), 'shared');
assert.equal(getLayer('lib/helpers.ts'), 'shared');

assert.equal(getLayerRank('shared'), 0);
assert.equal(getLayerRank('entities'), 1);
assert.equal(getLayerRank('features'), 2);
assert.equal(getLayerRank('widgets'), 3);
assert.equal(getLayerRank('views'), 4);
assert.equal(getLayerRank('app'), 5);
assert.equal(getLayerRank(null), null);

assert.equal(getFeatureName('features/cart/ui/Cart.tsx'), 'cart');
assert.equal(getFeatureName('features/auth/index.ts'), 'auth');
assert.equal(getFeatureName('shared/lib/utils.ts'), null);

assert.equal(isFeaturePublicImport('features/cart'), true);
assert.equal(isFeaturePublicImport('features/cart/index'), true);
assert.equal(isFeaturePublicImport('features/cart/ui/Button'), false);
assert.equal(isFeaturePublicImport('features/cart/ui/Button/index'), false);

assert.equal(
  resolveImportSource('@/features/cart/ui/Cart', cartUi, 'src'),
  'features/cart/ui/Cart',
);
assert.equal(
  resolveImportSource('@features/cart', cartUi, 'src'),
  'features/cart',
);
assert.equal(
  resolveImportSource('../hooks/useCart', cartUi, 'src'),
  'features/cart/hooks/useCart',
);
assert.equal(resolveImportSource('react', cartUi, 'src'), null);
assert.equal(resolveImportSource('@/shared/lib/utils', cartUi, 'src'), 'shared/lib/utils');
assert.equal(resolveImportSource('@entities/user', cartUi, 'src'), 'entities/user');
assert.equal(resolveImportSource('@widgets/header', cartUi, 'src'), 'widgets/header');
assert.equal(resolveImportSource('@views/HomeView', cartUi, 'src'), 'views/HomeView');
assert.equal(resolveImportSource('@app/page', cartUi, 'src'), 'app/page');

assert.equal(getSrcRelativePath(cartUi, 'src'), 'features/cart/ui/CartButton.tsx');
assert.equal(getSrcRelativePath('/outside/file.ts', 'src'), null);

assert.equal(isServerPackage('next/headers'), true);
assert.equal(isServerPackage('server-only'), true);
assert.equal(isServerPackage('node:fs'), true);
assert.equal(isServerPackage('next/server'), true);
assert.equal(isServerPackage('child_process'), true);
assert.equal(isServerPackage('react'), false);

assert.equal(isServerPath('features/cart/server/actions'), true);
assert.equal(isServerPath('features/cart/lib/db.server.ts'), true);
assert.equal(isServerPath('features/cart/lib/db.server.mjs'), true);
assert.equal(isServerPath('features/cart/ui/Button.tsx'), false);

assert.equal(getProjectRoot(cartUi, 'src'), fixturesRoot);
assert.equal(getProjectRoot('/tmp/outside.ts', 'src'), null);

assert.equal(
  resolveAbsoluteImportPath('../actions/save', cartUi, 'src'),
  path.join(fixturesRoot, 'src/features/cart/actions/save'),
);

const saveDirectives = readModuleDirectives(saveAction);
assert.equal(saveDirectives.server, true);
assert.equal(saveDirectives.client, false);

const missingDirectives = readModuleDirectives(path.join(fixturesRoot, 'src/missing-module'));
assert.deepEqual(missingDirectives, { client: false, server: false });

console.log('eslint-plugin-next-arch: layers unit tests passed');
