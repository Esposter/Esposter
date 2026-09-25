import type { Plugin } from "@oxlint/plugins";

import { noBareError } from "#src/services/oxlint/errorHandling/noBareError";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing the error-handling skill's rule that a thrown error names its operation and its
// Entity: `InvalidOperationError` (or a tRPC error constructor) over a bare `new Error(…)`, whose message is the
// Only thing a reader gets.
//
// The construct's domain is every `new Error` in the tree, and the sites that may not obey are the mechanism's
// Own rather than a list chosen for being clean, each switched off in `.oxlintrc.json` with its reason there:
// `packages/configuration` builds before `@esposter/shared` and so cannot import the class; `packages/azure-mock`
// Is the stubs, whose every throw is an unsupported-in-mock; `toAppError` is the boundary that constructs the
// Bare error other code wraps. A test builds bare errors to reject a mock with, so it is off there too. The one
// Site inside the domain that keeps a bare error on purpose — `requireAuthData`, whose whole job is that the
// Api's own sentence reaches the user unprefixed — carries the disable with that reason on the line.
const plugin: Plugin = definePlugin({
  meta: { name: "error-handling" },
  rules: { "no-bare-error": noBareError },
});

export default plugin;
