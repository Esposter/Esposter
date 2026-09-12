import type { Plugin } from "@oxlint/plugins";

import { noHandRolledError } from "#src/services/oxlint/trpcProcedure/noHandRolledError";
import { requireReturnType } from "#src/services/oxlint/trpcProcedure/requireReturnType";
import { definePlugin } from "@oxlint/plugins";
// Oxlint JS plugin enforcing the two decidable halves of the `trpc` skill, scoped in the root .oxlintrc.json to
// `apps/web/server/trpc/**` — `.query`/`.mutation` only mean a procedure there, and `TRPCError` is only
// Constructed there.
//
// Both rules exist to shrink the trpc ledger rather than to be swept forever: each was found by hand in two
// Consecutive sweep units, in the same shape, which is the signal that an enforcer should own it
// (`sweeps` skill, "Shrinking beats re-running").
//
// Neither needs type information. A missing generic is an absent `typeArguments`, and a hand-rolled error is an
// Object literal whose `message` reads `.message` off a `new *Error(...)` the repo already has a constructor for.
const plugin: Plugin = definePlugin({
  meta: { name: "trpc-procedure" },
  rules: { "no-hand-rolled-error": noHandRolledError, "require-return-type": requireReturnType },
});

export default plugin;
