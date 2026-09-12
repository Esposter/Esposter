import type { ESTree } from "@oxlint/plugins";

// A returned expression is only read as an effect when its promise-ness is certain from syntax alone: a `.then`
// Chain, or a `Promise.*` call. A plugin sees no types, so `return mapRoom(row)` and `return persist(row)` are the
// Same shape — and reporting the first would leave wrapping a pure transform in a best-effort handler as the only
// Way to silence the rule, which is the harm this standard exists to prevent. The cost is a returned bare promise
// Call going unflagged; a reviewer catches that, whereas noise trains everyone to silence the rule.
export const checkIsCertainPromiseExpression = (expression: ESTree.Expression): boolean =>
  expression.type === "CallExpression" &&
  expression.callee.type === "MemberExpression" &&
  expression.callee.property.type === "Identifier" &&
  (["catch", "finally", "then"].includes(expression.callee.property.name) ||
    (expression.callee.object.type === "Identifier" && expression.callee.object.name === "Promise"));
