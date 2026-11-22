import type { Plugin } from "@oxlint/plugins";

import { noEmptyInput } from "#src/services/oxlint/trpcProcedure/noEmptyInput";
import { noHandRolledError } from "#src/services/oxlint/trpcProcedure/noHandRolledError";
import { noPrototypeKey } from "#src/services/oxlint/trpcProcedure/noPrototypeKey";
import { requireQueryVerb } from "#src/services/oxlint/trpcProcedure/requireQueryVerb";
import { requireReturnType } from "#src/services/oxlint/trpcProcedure/requireReturnType";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing the decidable halves of the `trpc` skill, each scoped in the root oxlint.config.ts to
// Where its construct exists. Three read `apps/web/server/trpc/**`, since `.query`/`.mutation`/`router(…)` only
// Mean a procedure there; `no-hand-rolled-error` reads `apps/web/server/**`, where a `TRPCError` is constructed;
// And `no-empty-input` runs repo-wide, since the client calls procedures from every tree.
//
// `require-return-type` and `no-hand-rolled-error` exist to shrink the trpc ledger rather than to be swept forever:
// Each is a rule a hand sweep keeps finding, which is the signal that an enforcer should own it (`sweeps` skill,
// "Shrinking beats re-running"). `require-query-verb` holds the skill's three query verbs, `no-prototype-key` the keys
// A client proxy resolves off `Function.prototype` instead of the router, and `no-empty-input` the `.query({})` an
// All-optional input never needs.
//
// None needs type information, and none carries a list the repo can outgrow: the verbs are the convention's own,
// The prototype keys the language's, and a missing generic is an absent `typeArguments` on a call written with an
// Inline handler — the handler is what makes a `.query(`/`.mutation(` a procedure, whatever its receiver is named.
const plugin: Plugin = definePlugin({
  meta: { name: "trpc-procedure" },
  rules: {
    "no-empty-input": noEmptyInput,
    "no-hand-rolled-error": noHandRolledError,
    "no-prototype-key": noPrototypeKey,
    "require-query-verb": requireQueryVerb,
    "require-return-type": requireReturnType,
  },
});

export default plugin;
