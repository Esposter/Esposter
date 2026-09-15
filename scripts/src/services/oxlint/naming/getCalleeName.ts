import type { ESTree } from "@oxlint/plugins";

// The last identifier of what a declarator's initialiser calls — `readPost` for both `readPost(…)` and
// `caller.readPost(…)`, through an `await` — or nothing when the initialiser is not a call at all
export const getCalleeName = (init: ESTree.Expression | null | undefined): string | undefined => {
  const expression = init?.type === "AwaitExpression" ? init.argument : init;
  if (expression?.type !== "CallExpression") return undefined;

  const { callee } = expression;
  if (callee.type === "Identifier") return callee.name;
  else if (callee.type === "MemberExpression" && callee.property.type === "Identifier") return callee.property.name;
  else return undefined;
};
