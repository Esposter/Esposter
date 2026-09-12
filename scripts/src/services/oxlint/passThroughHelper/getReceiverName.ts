import type { ESTree } from "@oxlint/plugins";

// The receiver a member call dispatches on, when it is a bare identifier: `client.deleteEntity(...)` -> `client`.
export const getReceiverName = (expression: ESTree.CallExpression | ESTree.NewExpression): string | undefined => {
  if (expression.type !== "CallExpression" || expression.callee.type !== "MemberExpression") return undefined;
  const { object } = expression.callee;
  return object.type === "Identifier" ? object.name : undefined;
};
