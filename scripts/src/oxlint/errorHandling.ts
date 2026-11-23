import type { Plugin } from "@oxlint/plugins";

import { noBareError } from "#src/services/oxlint/errorHandling/noBareError";
import { noUncommentedFallback } from "#src/services/oxlint/errorHandling/noUncommentedFallback";
import { noUnfinalizedResource } from "#src/services/oxlint/errorHandling/noUnfinalizedResource";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing the error-handling skill's rules that a shape a linter cannot otherwise see is named where
// It is written. `no-bare-error`: a thrown error names its operation and its entity — `InvalidOperationError` (or a tRPC
// Error constructor) over a bare `new Error(…)`, whose message is the only thing a reader gets. `no-uncommented-fallback`:
// A failure that becomes `undefined`, `false` or an empty value is logged, or a comment beside it names why it is expected.
// `no-unfinalized-resource`: a binding an `await` made is released by a finalizer before the next `await`, so a rejection in
// Between does not leave it open.
//
// The two fallback and finalizer rules carry no exception list: a sentinel or a finalizer has the same shape wherever it is
// Written, and a comment beside the call, a rethrow or a log is what passes it.
//
// The construct's domain is every `new Error` in the tree, and a site that keeps a bare error on purpose carries
// The disable with its reason on the site, so a new file is reported rather than exempted by a path it happens to
// Share: `toAppError`, the boundary that constructs the bare error other code wraps; and `requireAuthData`,
// Whose whole job is that the Api's own sentence reaches the user unprefixed. A test builds bare errors to reject a
// Mock with, so it is off there.
const plugin: Plugin = definePlugin({
  meta: { name: "error-handling" },
  rules: {
    "no-bare-error": noBareError,
    "no-uncommented-fallback": noUncommentedFallback,
    "no-unfinalized-resource": noUnfinalizedResource,
  },
});

export default plugin;
