import vitest from "@vitest/eslint-plugin";
import { defineConfig } from "eslint/config";

export default defineConfig({
  files: ["**/**.test.ts", "**/**.test-d.ts"],
  languageOptions: {
    globals: vitest.environments.env.globals,
  },
  plugins: {
    vitest,
  },
  rules: {
    ...vitest.configs.all.rules,
    "vitest/consistent-test-it": ["error", { fn: "test" }],
    "vitest/max-expects": "off",
    "vitest/no-hooks": "off",
    "vitest/no-importing-vitest-globals": "off",
    "vitest/no-interpolation-in-snapshots": "off",
    "vitest/prefer-to-be-falsy": "off",
    "vitest/prefer-to-be-truthy": "off",
    "vitest/require-hook": "off",
  },
  settings: {
    vitest: {
      typecheck: true,
    },
  },
});
