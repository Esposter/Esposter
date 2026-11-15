import type { Plugin } from "@oxlint/plugins";

import { noLiteralMapKey } from "#src/services/oxlint/valueSetMap/noLiteralMapKey";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing the value set rule for maps: a constant map is keyed by a set's members, not by literal
// Names. A map over an open set of keys is `Record<string, …>`, which no set can name, so its literal keys are left alone.
const plugin: Plugin = definePlugin({
  meta: { name: "value-set-map" },
  rules: { "no-literal-map-key": noLiteralMapKey },
});

export default plugin;
