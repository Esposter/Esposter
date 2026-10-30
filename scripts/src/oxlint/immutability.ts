import type { Plugin } from "@oxlint/plugins";

import { noMapMutation } from "#src/services/oxlint/immutability/noMapMutation";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing immutability where a callback is handed an element it must not change.
// A `.map` callback builds the new element and never writes to the one it was given.
// That element belongs to the source array.
const plugin: Plugin = definePlugin({ meta: { name: "immutability" }, rules: { "no-map-mutation": noMapMutation } });

export default plugin;
