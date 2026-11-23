import ignores from "@esposter/configuration/eslint/ignores.js";
import nuxtOverrides from "@esposter/configuration/eslint/overrides/nuxt.js";
import oxlint from "@esposter/configuration/eslint/oxlint.js";
import plugins from "@esposter/configuration/eslint/plugins/index.js";
import { removeRetiredNuxtRules } from "@esposter/configuration/eslint/retiredNuxtRules.js";

import { withNuxt } from "../../../apps/web/.nuxt/eslint.config.mjs";

// The vize lint holds a page, a layout and a server component to one root, so Nuxt's own block for it goes too. The
// Selector bans are oxlint's `selector-ban/no-restricted-syntax`, each list scoped by its own paths
export default removeRetiredNuxtRules(withNuxt(plugins).remove("nuxt/vue/single-root"))
  .overrides(nuxtOverrides)
  .append(oxlint)
  .append(ignores);
