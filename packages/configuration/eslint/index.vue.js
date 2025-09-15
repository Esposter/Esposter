import languageOptions from "@esposter/configuration/eslint/languageOptions.js";
import nuxtPlugin from "@esposter/configuration/eslint/nuxtPlugin.js";
import nuxtOverrides from "@esposter/configuration/eslint/overrides/nuxt.js";
import typescriptRulesOverrides from "@esposter/configuration/eslint/overrides/typescriptRules.js";
import typescriptIgnores from "@esposter/configuration/eslint/typescriptIgnores.js";
import typescriptRules from "@esposter/configuration/eslint/typescriptRules.js";
import oxlint from "@esposter/configuration/oxlint.js";

import { withNuxt } from "../../app/.nuxt/eslint.config.mjs";

export default withNuxt(nuxtPlugin)
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
  .append(oxlint);
