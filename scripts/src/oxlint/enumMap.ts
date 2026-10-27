import type { Plugin } from "@oxlint/plugins";

import { noLiteralMapKey } from "#src/services/oxlint/enumMap/noLiteralMapKey";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing the enum rule for maps: a constant map is keyed by enum members, not by literal names.
// A map over an open set of keys is `Record<string, …>`, which no enum can name, so its literal keys are left alone.
const plugin: Plugin = definePlugin({ meta: { name: "enum-map" }, rules: { "no-literal-map-key": noLiteralMapKey } });

export default plugin;
