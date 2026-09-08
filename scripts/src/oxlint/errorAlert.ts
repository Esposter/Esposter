import type { Plugin } from "@oxlint/plugins";

import { definePlugin, defineRule } from "@oxlint/plugins";
// An oxlint JS plugin enforcing "who alerts a tRPC rejection" (error-handling/SKILL.md).
//
// The error link already alerts the codes it owns, so a caller that reads `error.message` off a rejection and
// Hands it to `createAlert` puts a second identical toast on screen for one failure. `createErrorAlert` is the
// One caller-side alert precisely because it asks `checkIsAlertedByErrorLink` first — spelled out per site, that
// Guard is a line every caller can forget, and each one that does ships the double toast.
//
// The check is the narrowest shape that means "this is a rejection rather than a message the caller composed":
// The first argument is a bare `.message` read. A template literal or a string literal naming a validation
// Failure is the caller's own sentence, has no error behind it, and is left alone — which is why
// `createAlert("Dataset has no rows to export", "warning")` and `createAlert(`${file.name}: ${message}`, "error")`
// Both pass.
//
// It is off for `createErrorAlert.ts` and `errorLink.ts` (root .oxlintrc.json, which takes no comments): those
// Two ARE the mechanism, and the alert-store call inside each is the one the rule exists to route every caller
// Through.
//
// What it cannot see is an alert written inside a Vue template's inline handler, which oxlint's `.vue` support
// Does not hand to a JS plugin — those stay a review catch.
const MESSAGE =
  "A rejection reaches the user through createErrorAlert(error), which asks the error link first — alerting error.message directly stacks a second toast on a failure the link already showed.";

const rule = defineRule({
  create: (context) => ({
    CallExpression(node) {
      if (node.callee.type !== "Identifier" || node.callee.name !== "createAlert") return;
      const [text] = node.arguments;
      if (text?.type !== "MemberExpression" || text.computed) return;
      else if (text.property.type !== "Identifier" || text.property.name !== "message") return;

      context.report({ message: MESSAGE, node });
    },
  }),
  meta: { type: "suggestion" },
});

const plugin: Plugin = definePlugin({
  meta: { name: "error-alert" },
  rules: { "no-raw-error-alert": rule },
});

export default plugin;
