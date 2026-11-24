import type { Plugin } from "@oxlint/plugins";

import { noBareError } from "#src/services/oxlint/errorHandling/noBareError";
import { noUncommentedFallback } from "#src/services/oxlint/errorHandling/noUncommentedFallback";
import { noUnfinalizedResource } from "#src/services/oxlint/errorHandling/noUnfinalizedResource";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing the error-handling skill's rules that a shape a linter cannot otherwise see is named
// Where it is written. `no-bare-error`: a thrown error names its operation and its entity — `InvalidOperationError` (or
// A tRPC Error constructor) over a bare `new Error(…)`, whose message is the only thing a reader gets.
// `no-uncommented-fallback`: A failure that becomes `undefined`, `false` or an empty value is logged, or a comment
// Beside it names why it is expected. `no-unfinalized-resource`: a binding an `await` made is released by a finalizer
// Before the next `await`, so a rejection in Between does not leave it open. The two fallback and finalizer rules carry
// No exception list: a sentinel or a finalizer has the same shape wherever it is written, and a comment beside the
// Call, a rethrow or a log is what passes it. The construct's domain is every `new Error` in the tree, and a site that
// Keeps a bare error on purpose carries the disable with its reason on the site, so a new file is reported rather than
// Exempted by a path it happens to share: `toAppError`, the boundary that constructs the bare error other code wraps;
// And `requireAuthData`, whose whole job is that the Api's own sentence reaches the user unprefixed. A test builds bare
// Errors to reject a mock with, so it is off there.
const plugin: Plugin = definePlugin({
  meta: { name: "error-handling" },
  rules: {
    "no-bare-error": noBareError,
    "no-uncommented-fallback": noUncommentedFallback,
    "no-unfinalized-resource": noUnfinalizedResource,
  },
});

export default plugin;
