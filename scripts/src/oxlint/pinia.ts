import type { Plugin } from "@oxlint/plugins";

import { neverExportInitializedStore } from "#src/services/oxlint/pinia/neverExportInitializedStore";
import { noDuplicateStoreIds } from "#src/services/oxlint/pinia/noDuplicateStoreIds";
import { noReturnGlobalProperties } from "#src/services/oxlint/pinia/noReturnGlobalProperties";
import { noStoreToRefsInStore } from "#src/services/oxlint/pinia/noStoreToRefsInStore";
import { preferUseStoreNamingConvention } from "#src/services/oxlint/pinia/preferUseStoreNamingConvention";
import { definePlugin } from "@oxlint/plugins";

// The Pinia rules of eslint-plugin-pinia that this repo enables, ported to oxlint's JS plugin API under the same names,
// So each `pinia/<rule>` key reads as it did. Each reads Pinia's own API by name (`defineStore`, `storeToRefs`, `inject`,
// `useRoute`), so its scope is the construct's domain. The package's `require-setup-store-properties-export` and
// `prefer-single-store-per-file` are not ported: the config switches the first off and the preset the second.
// `prefer-use-store-naming-convention` takes no options: the config sets neither of the upstream rule's two, a suffix
// And a match to the store's id, so the port reads neither.
const plugin: Plugin = definePlugin({
  meta: { name: "pinia" },
  rules: {
    "never-export-initialized-store": neverExportInitializedStore,
    "no-duplicate-store-ids": noDuplicateStoreIds,
    "no-return-global-properties": noReturnGlobalProperties,
    "no-store-to-refs-in-store": noStoreToRefsInStore,
    "prefer-use-store-naming-convention": preferUseStoreNamingConvention,
  },
});

export default plugin;
