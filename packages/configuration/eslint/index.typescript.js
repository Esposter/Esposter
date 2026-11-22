import ignores, { TEST_FILE_PATTERNS } from "@esposter/configuration/eslint/ignores.js";
import nuxtOverrides from "@esposter/configuration/eslint/overrides/nuxt.js";
import oxlint from "@esposter/configuration/eslint/oxlint.js";
import plugins from "@esposter/configuration/eslint/plugins/index.js";
import restrictedModuleSyntaxes from "@esposter/configuration/eslint/restrictedModuleSyntaxes.js";
import restrictedOverloadSyntaxes from "@esposter/configuration/eslint/restrictedOverloadSyntaxes.js";
import restrictedSourceSyntaxes from "@esposter/configuration/eslint/restrictedSourceSyntaxes.js";
import restrictedTestSyntaxes from "@esposter/configuration/eslint/restrictedTestSyntaxes.js";
import restrictedUtilImports from "@esposter/configuration/eslint/restrictedUtilImports.js";
import typescriptRules from "@esposter/configuration/eslint/typescriptRules.js";

import { withNuxt } from "../../../apps/web/.nuxt/eslint.config.mjs";

// The rules are the `no-restricted-syntax` bans oxlint cannot express, scoped to the `.ts` source these
// Non-Vue packages hold.
export default withNuxt(plugins, {
  files: ["**/*.ts"],
  rules: {
    ...typescriptRules,
    "no-restricted-syntax": [
      ...typescriptRules["no-restricted-syntax"],
      ...restrictedModuleSyntaxes,
      ...restrictedSourceSyntaxes,
    ],
  },
})
  .overrides(nuxtOverrides)
  .append(oxlint)
  .append({
    files: ["**/util/**/*.ts"],
    ignores: TEST_FILE_PATTERNS,
    rules: { "no-restricted-imports": ["error", restrictedUtilImports] },
  })
  // A test setup file mocks modules and re-imports after mocking, as a test does, so it takes the test bans
  .append({
    files: ["**/*.test.ts", "**/test/setup.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...typescriptRules["no-restricted-syntax"].slice(1),
        ...restrictedModuleSyntaxes,
        ...restrictedTestSyntaxes,
      ],
    },
  })
  // A declaration file augments third-party APIs that are overloaded already, so the overload bans stop at its door
  .append({
    files: ["**/*.d.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...typescriptRules["no-restricted-syntax"]
          .slice(1)
          .filter((entry) => !restrictedOverloadSyntaxes.includes(entry)),
        ...restrictedModuleSyntaxes,
        ...restrictedSourceSyntaxes,
      ],
    },
  })
  .append(ignores);
