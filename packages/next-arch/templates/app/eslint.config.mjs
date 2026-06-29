import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import nextArch from "eslint-plugin-next-arch";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "next-arch": nextArch,
    },
    settings: {
      "next-arch": {
        srcDir: "src",
      },
    },
    rules: {
      "next-arch/no-cross-feature-imports": "error",
      "next-arch/no-deep-imports": "error",
      "next-arch/no-server-in-client": "error",
      "next-arch/no-upward-imports": "error",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
