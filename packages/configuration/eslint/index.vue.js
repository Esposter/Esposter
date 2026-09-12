import ignores from "@esposter/configuration/eslint/ignores.js";
import nuxtOverrides from "@esposter/configuration/eslint/overrides/nuxt.js";
import oxlint from "@esposter/configuration/eslint/oxlint.js";
import plugins from "@esposter/configuration/eslint/plugins/index.js";
import restrictedDateSyntaxes from "@esposter/configuration/eslint/restrictedDateSyntaxes.js";
import restrictedStoreSyntaxes from "@esposter/configuration/eslint/restrictedStoreSyntaxes.js";
import restrictedTestSyntaxes from "@esposter/configuration/eslint/restrictedTestSyntaxes.js";
import restrictedWatchSyntaxes from "@esposter/configuration/eslint/restrictedWatchSyntaxes.js";
import typescriptRules from "@esposter/configuration/eslint/typescriptRules.js";

// A relative reach out of the package, against the alias rule everywhere else: Nuxt writes this file into the
// App's .nuxt/ at prepare time, and no `#` map or package export points at a generated file in a sibling package
import { withNuxt } from "../../../apps/web/.nuxt/eslint.config.mjs";

export default withNuxt(plugins)
  .overrides({
    ...nuxtOverrides,
    "nuxt/typescript/rules": {
      rules: typescriptRules,
    },
  })
  .append(oxlint)
  // A component may not format a date itself, where a service may — and eslint replaces a rule's options
  // Rather than merging them, so the script-side bans are carried over and the date ones appended.
  .append({
    files: ["**/*.vue"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...typescriptRules["no-restricted-syntax"].slice(1),
        ...restrictedDateSyntaxes,
        ...restrictedStoreSyntaxes,
        ...restrictedWatchSyntaxes,
      ],
    },
  })
  // A `watch` sits in a store or a composable as often as in a component, so the alias ban is the one script-side
  // Addition that has to reach `.ts` as well.
  .append({
    files: ["**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...typescriptRules["no-restricted-syntax"].slice(1),
        ...restrictedWatchSyntaxes,
      ],
    },
  })
  // A test file carries the script-side bans plus its own — a typed `vi.fn` — the same carry-the-base-over
  // Shape the date bans use above, the watch aliases included since this override replaces the `.ts` one.
  .append({
    files: ["**/*.test.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...typescriptRules["no-restricted-syntax"].slice(1),
        ...restrictedTestSyntaxes,
        ...restrictedWatchSyntaxes,
      ],
    },
  })
  .append(ignores);
