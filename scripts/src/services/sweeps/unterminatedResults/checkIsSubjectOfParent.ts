import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

import { parents } from "#src/services/shared/getParent";

// Whether `node` is the subject of the link above it: a bracket, an await, a non-null assertion, or a member or
// Call written on it. An argument or a callback body is not, since the value leaves the expression there
export const checkIsSubjectOfParent = (node: SyntaxNode): boolean => {
  const parent = parents.get(node);
  if (parent?.type === "MemberExpression") return !parent.computed && parent.object === node;
  if (parent?.type === "CallExpression") return parent.callee === node;
  return (
    parent?.type === "ParenthesizedExpression" ||
    parent?.type === "AwaitExpression" ||
    parent?.type === "TSNonNullExpression"
  );
};
