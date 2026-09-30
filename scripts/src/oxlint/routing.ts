import type { Plugin } from "@oxlint/plugins";

import { noRouteLiteral } from "#src/services/oxlint/routing/noRouteLiteral";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing the routing skill's rule that a route is `RoutePath`'s: a string spelling one of its
// Paths is a copy the next rename leaves behind, as a test's typed `/agent-console` was when the page moved
const plugin: Plugin = definePlugin({ meta: { name: "routing" }, rules: { "no-route-literal": noRouteLiteral } });

export default plugin;
