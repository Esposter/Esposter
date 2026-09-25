import type { Plugin } from "@oxlint/plugins";

import { noBareError } from "#src/services/oxlint/errorHandling/noBareError";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing the error-handling skill's rule that a thrown error names its operation and its
// Entity: `InvalidOperationError` (or a tRPC error constructor) over a bare `new Error(…)`, whose message is the
// Only thing a reader gets.
//
// The construct's domain is every `new Error` in the tree, and a site that keeps a bare error on purpose carries
// The disable with its reason on the site, so a new file is reported rather than exempted by a path it happens to
// Share: `generateExports` in `packages/configuration`, which builds before `@esposter/shared` and so cannot import
// The class, and `requireAuthData`, whose whole job is that the Api's own sentence reaches the user unprefixed. A
// Test builds bare errors to reject a mock with, so it is off there. `packages/azure-mock` (the stubs, whose every
// Throw is an unsupported-in-mock) and `toAppError` (the boundary that constructs the bare error other code wraps)
// Are still switched off by path in `.oxlintrc.json`, pending the same move to their sites.
const plugin: Plugin = definePlugin({
  meta: { name: "error-handling" },
  rules: { "no-bare-error": noBareError },
});

export default plugin;
