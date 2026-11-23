import ignores, { TEST_FILE_PATTERNS } from "@esposter/configuration/eslint/ignores.js";
import nuxtOverrides from "@esposter/configuration/eslint/overrides/nuxt.js";
import oxlint from "@esposter/configuration/eslint/oxlint.js";
import plugins from "@esposter/configuration/eslint/plugins/index.js";
import restrictedUtilImports from "@esposter/configuration/eslint/restrictedUtilImports.js";

import { withNuxt } from "../../../apps/web/.nuxt/eslint.config.mjs";

// The selector bans are oxlint's `selector-ban/no-restricted-syntax`, each list scoped by its own paths. The Nuxt and
// Link-checker rules are deleted (`openspec/changes/architecture-eslint-retirement/design.md`, Decisions)
export default withNuxt(plugins)
  .remove("nuxt/rules")
  .remove("nuxt/pages")
  .remove("nuxt/nuxt-config")
  .remove("nuxt-link-checker/valid-route")
  .remove("nuxt-link-checker/valid-route-markdown")
  .overrides(nuxtOverrides)
  .append(oxlint)
  .append({
    files: ["**/util/**/*.ts"],
    ignores: TEST_FILE_PATTERNS,
    rules: { "no-restricted-imports": ["error", restrictedUtilImports] },
  })
  .append(ignores);
