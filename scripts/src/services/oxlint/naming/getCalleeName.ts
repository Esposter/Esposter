import type { ESTree } from "@oxlint/plugins";

// The last identifier of what a declarator's initialiser calls — `readPost` for both `readPost(…)` and
// `caller.readPost(…)`, through an `await` and through the `ChainExpression` an optional call is wrapped in —
// or nothing when the initialiser is not a call at all
export const getCalleeName = (init: ESTree.Expression | null | undefined): string | undefined => {
  const awaited = init?.type === "AwaitExpression" ? init.argument : init;
  const expression = awaited?.type === "ChainExpression" ? awaited.expression : awaited;
  if (expression?.type !== "CallExpression") return undefined;

  const { callee } = expression;
  if (callee.type === "Identifier") return callee.name;
  else if (callee.type === "MemberExpression" && callee.property.type === "Identifier") return callee.property.name;
  else return undefined;
};
