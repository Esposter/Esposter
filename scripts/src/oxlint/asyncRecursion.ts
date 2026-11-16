import type { Plugin } from "@oxlint/plugins";

import { noAsyncSelfCall } from "#src/services/oxlint/asyncRecursion/noAsyncSelfCall";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing that a sequence of awaits is a loop (the runtime-efficiency skill's sequential-loops
// Page): an async function that calls itself is the same loop with a pending promise held per level
const plugin: Plugin = definePlugin({
  meta: { name: "async-recursion" },
  rules: { "no-async-self-call": noAsyncSelfCall },
});

export default plugin;
