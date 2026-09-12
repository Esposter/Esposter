import ignores from "@esposter/configuration/eslint/ignores.js";
import nuxtOverrides from "@esposter/configuration/eslint/overrides/nuxt.js";
import oxlint from "@esposter/configuration/eslint/oxlint.js";
import plugins from "@esposter/configuration/eslint/plugins/index.js";
import restrictedTestSyntaxes from "@esposter/configuration/eslint/restrictedTestSyntaxes.js";
import typescriptRules from "@esposter/configuration/eslint/typescriptRules.js";

// A relative reach out of the package, against the alias rule everywhere else: Nuxt writes this file into the
// App's .nuxt/ at prepare time, and no `#` map or package export points at a generated file in a sibling package
import { withNuxt } from "../../../apps/web/.nuxt/eslint.config.mjs";
// The rules are the `no-restricted-syntax` bans oxlint cannot express, scoped to the `.ts` source these
// Non-Vue packages hold.
export default withNuxt(plugins, {
  files: ["**/*.ts"],
  rules: typescriptRules,
})
  .overrides(nuxtOverrides)
  .append(oxlint)
  .append({
    files: ["**/*.test.ts"],
    rules: {
      "no-restricted-syntax": ["error", ...typescriptRules["no-restricted-syntax"].slice(1), ...restrictedTestSyntaxes],
    },
  })
  .append(ignores);
