import type { ESTree } from "@oxlint/plugins";

// The identifier a call chain ultimately dispatches on: `getResultAsync(...).orTee(...).unwrapOr(...)`
// Roots at `getResultAsync`; `containerClient.deleteBlob(...)` roots at nothing nameable (undefined).
export const getRootCalleeName = (expression: ESTree.Expression): string | undefined => {
  if (expression.type === "CallExpression") {
    if (expression.callee.type === "Identifier") return expression.callee.name;
    if (expression.callee.type === "MemberExpression") return getRootCalleeName(expression.callee.object);
    return undefined;
  }
  if (expression.type === "MemberExpression") return getRootCalleeName(expression.object);
  return undefined;
};
