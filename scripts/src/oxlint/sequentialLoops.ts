import type { Plugin } from "@oxlint/plugins";

import { noAsyncSelfCall } from "#src/services/oxlint/sequentialLoops/noAsyncSelfCall";
import { requireLoopShape } from "#src/services/oxlint/sequentialLoops/requireLoopShape";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing the runtime-efficiency skill's sequential-loops page: awaits run in sequence only for a
// Dependency the page names.
//
// `no-async-self-call` reports an async function calling itself from its own body, which is the same loop with a
// Pending promise held per level; a call from a nested callback is a walk's branch and is left alone.
//
// `require-loop-shape` reports a `no-await-in-loop` directive whose reason does not open with one of the page's shapes,
// So a sequence is justified by a dependency already argued rather than afresh at each loop.
const plugin: Plugin = definePlugin({
  meta: { name: "sequential-loops" },
  rules: { "no-async-self-call": noAsyncSelfCall, "require-loop-shape": requireLoopShape },
});

export default plugin;
