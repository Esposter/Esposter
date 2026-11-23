import type { ESTree } from "@oxlint/plugins";

// The name a call's callee is rooted at, through a member chain (`describe.todo`) and a call on a call
// (`test.each(table)`), Or `undefined` when the root is not a name
export const getCalleeRootName = (callee: ESTree.CallExpression["callee"]): string | undefined => {
  if (callee.type === "Identifier") return callee.name;
  if (callee.type === "MemberExpression") return getCalleeRootName(callee.object);
  if (callee.type === "CallExpression") return getCalleeRootName(callee.callee);
  return undefined;
};
