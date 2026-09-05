import nuxtOverrides from "@esposter/configuration/eslint/overrides/nuxt.js";
import oxlint from "@esposter/configuration/eslint/oxlint.js";
import plugins from "@esposter/configuration/eslint/plugins/index.js";
import restrictedDateSyntaxes from "@esposter/configuration/eslint/restrictedDateSyntaxes.js";
import restrictedStoreSyntaxes from "@esposter/configuration/eslint/restrictedStoreSyntaxes.js";
import restrictedTestSyntaxes from "@esposter/configuration/eslint/restrictedTestSyntaxes.js";
import typescriptRules from "@esposter/configuration/eslint/typescriptRules.js";

import { withNuxt } from "../../app/.nuxt/eslint.config.mjs";

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
      ],
    },
  })
  // A test file carries the script-side bans plus its own — a typed `vi.fn` — the same carry-the-base-over
  // Shape the date bans use above.
  .append({
    files: ["**/*.test.ts"],
    rules: {
      "no-restricted-syntax": ["error", ...typescriptRules["no-restricted-syntax"].slice(1), ...restrictedTestSyntaxes],
    },
  })
  // `public` is generated/static assets, the generated tileset `.tsx` included, and oxlint already ignores
  // It. Skipping it here too keeps eslint from walking the whole tree calculating a config per file.
  .append({ ignores: ["**/*.md", "public/**"] });
