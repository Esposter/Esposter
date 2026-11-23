import type { Plugin } from "@oxlint/plugins";

import { requireImportType } from "#src/services/oxlint/vueTypeImports/requireImportType";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin for the `.vue` script blocks oxlint's `typescript/consistent-type-imports` never reads. Its rule is
// Enabled for `**/*.vue` only in the root oxlint.config.ts.
const plugin: Plugin = definePlugin({
  meta: { name: "vue-type-imports" },
  rules: { "require-import-type": requireImportType },
});

export default plugin;
