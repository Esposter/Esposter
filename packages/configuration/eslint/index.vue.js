import languageOptions from "@esposter/configuration/eslint/languageOptions.js";
import nuxtOverrides from "@esposter/configuration/eslint/overrides/nuxt.js";
import typescriptRulesOverrides from "@esposter/configuration/eslint/overrides/typescriptRules.js";
import oxlint from "@esposter/configuration/eslint/oxlint.js";
import plugins from "@esposter/configuration/eslint/plugins/index.js";
import typescriptIgnores from "@esposter/configuration/eslint/typescriptIgnores.js";
import typescriptRules from "@esposter/configuration/eslint/typescriptRules.js";

import { withNuxt } from "../../app/.nuxt/eslint.config.mjs";

export default withNuxt(plugins)
  .overrides({
    ...nuxtOverrides,
    "nuxt/typescript/rules": {
      ignores: typescriptIgnores,
      languageOptions,
      rules: {
        ...typescriptRules,
        ...typescriptRulesOverrides,
      },
    },
  })
  .append(oxlint)
  // `public` is generated/static assets (incl. generated tileset `.tsx`); oxlint already ignores it,
  // So skip it here too — otherwise eslint walks the whole 64MB tree calculating config per file.
  .append({ ignores: ["**/*.md", "public/**"] });
