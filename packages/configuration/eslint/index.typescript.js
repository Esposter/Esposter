import nuxtOverrides from "@esposter/configuration/eslint/overrides/nuxt.js";
import oxlint from "@esposter/configuration/eslint/oxlint.js";
import plugins from "@esposter/configuration/eslint/plugins/index.js";
import typescriptRules from "@esposter/configuration/eslint/typescriptRules.js";

import { withNuxt } from "../../app/.nuxt/eslint.config.mjs";
/**
 * Unfortunately, running all typescript-eslint rules in vue files is so slow, it's unrealistic to put it in CI/CD,
 * so we have a light version that lints the extra typescript-eslint rules only in ts files so we can use it in CI/CD
 */
export default withNuxt(plugins, {
  files: ["**/*.ts"],
  rules: typescriptRules,
})
  .overrides(nuxtOverrides)
  .append(oxlint)
  // `public` is generated/static assets (incl. generated tileset `.tsx`); oxlint already ignores it,
  // So skip it here too — otherwise eslint walks the whole 64MB tree calculating config per file.
  .append({ ignores: ["**/*.md", "public/**"] });
