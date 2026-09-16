import type { Plugin } from "@oxlint/plugins";

import { noCallNamedBinding } from "#src/services/oxlint/naming/noCallNamedBinding";
import { definePlugin } from "@oxlint/plugins";
// An oxlint JS plugin enforcing the naming skill's rule that a call's result is named for what it holds.
//
// `const readPost = await caller.readPost(…)` binds the row under the fetch's own name, so every later read of
// `readPost` reads as a call. The naming sweep wrote this finding in five files before it reached here, and the
// Fix was the same each time: drop the verb, since the binding is the value rather than the operation.
//
// It is purely syntactic — a declarator whose name equals the last identifier of the call it is initialised
// With, through an `await` and through an optional call, where that name opens with one of the naming skill's own
// Function prefixes. The prefix list is the convention's own vocabulary rather than a roster of the repo's
// Helpers: a call named for what it returns (`file.text()`, `scene.add.sprite(…)`) has no verb to drop and is
// Left alone.
const plugin: Plugin = definePlugin({
  meta: { name: "naming" },
  rules: { "no-call-named-binding": noCallNamedBinding },
});

export default plugin;
