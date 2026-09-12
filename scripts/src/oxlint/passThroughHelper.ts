import type { Plugin } from "@oxlint/plugins";

import { noForwardingWrapper } from "#src/services/oxlint/passThroughHelper/noForwardingWrapper";
import { definePlugin } from "@oxlint/plugins";
// An oxlint JS plugin enforcing the "an extraction earns its existence" rule (file-organization/SKILL.md).
//
// An exported arrow whose whole body is one call passing exactly its own parameters, in order, adding nothing,
// Is a rename with an import: the caller still hand-writes every argument, so forgetting one is exactly as easy
// As it was inline. The check is purely syntactic and runs in oxlint's single root pass.
//
// What it deliberately cannot see is why a wrapper is kept, so three shapes are exempted here rather than
// Reported and disabled everywhere they occur:
//
// - A member call on an UPPER_SNAKE object (`UUIDV4_REGEX.test(uuid)`) supplies the constant its callers would
//   Otherwise restate, which is the textbook earned extraction.
// - A parameter with a default (`(a, b = X) => f(a, b)`) supplies that default.
// - A non-identifier argument — a literal, an `as`, an arrow, a member access — is something the caller did not
//   Hand over, so the wrapper is absorbing at least that much.
//
// Everything left over is reported, and the repo carries no production suppression for it: a narrowed parameter
// Type, a "single definition point" several reads agree on and an upstream API name were each considered and
// Rejected as reasons to keep a wrapper, so the rule is the convention rather than a default to argue with.
//
// It is off for `*.test.ts`/`*.bench.ts` (root .oxlintrc.json, which takes no comments): a colocated module
// Double exists precisely to mirror the real signature, so forwarding is the whole point there.
const plugin: Plugin = definePlugin({
  meta: { name: "pass-through-helper" },
  rules: { "no-forwarding-wrapper": noForwardingWrapper },
});

export default plugin;
