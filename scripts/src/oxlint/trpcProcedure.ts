import type { Plugin } from "@oxlint/plugins";

import { noEmptyInput } from "#src/services/oxlint/trpcProcedure/noEmptyInput";
import { noHandRolledError } from "#src/services/oxlint/trpcProcedure/noHandRolledError";
import { noPrototypeKey } from "#src/services/oxlint/trpcProcedure/noPrototypeKey";
import { requireQueryVerb } from "#src/services/oxlint/trpcProcedure/requireQueryVerb";
import { requireReturnType } from "#src/services/oxlint/trpcProcedure/requireReturnType";
import { definePlugin } from "@oxlint/plugins";
// An oxlint JS plugin enforcing the decidable halves of the `trpc` skill. Four rules are scoped in the root
// .oxlintrc.json to `apps/web/server/trpc/**` — `.query`/`.mutation`/`router(…)` only mean a procedure there, and
// `TRPCError` is only constructed there — and `no-empty-input` runs repo-wide, since the client calls procedures
// From every tree.
//
// `require-return-type` and `no-hand-rolled-error` exist to shrink the trpc ledger rather than to be swept forever:
// Each was found by hand in two consecutive sweep units, in the same shape, which is the signal that an enforcer
// Should own it (`sweeps` skill, "Shrinking beats re-running"). `require-query-verb` holds the skill's three query
// Verbs, `no-prototype-key` the keys a client proxy resolves off `Function.prototype` instead of the router, and
// `no-empty-input` the `.query({})` an all-optional input never needs.
//
// None needs type information, and none carries a list the repo can outgrow: the verbs are the convention's own,
// The prototype keys the language's, and a missing generic is an absent `typeArguments`.
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
