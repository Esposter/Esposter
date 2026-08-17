import nuxtOverrides from "@esposter/configuration/eslint/overrides/nuxt.js";
import oxlint from "@esposter/configuration/eslint/oxlint.js";
import plugins from "@esposter/configuration/eslint/plugins/index.js";
import restrictedDateSyntaxes from "@esposter/configuration/eslint/restrictedDateSyntaxes.js";
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
      "no-restricted-syntax": ["error", ...typescriptRules["no-restricted-syntax"].slice(1), ...restrictedDateSyntaxes],
    },
  })
  // `public` is generated/static assets (incl. generated tileset `.tsx`); oxlint already ignores it,
  // So skip it here too — otherwise eslint walks the whole 64MB tree calculating config per file.
  .append({ ignores: ["**/*.md", "public/**"] });
