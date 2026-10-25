import ts from "typescript";

// Whether `node` is the subject of the link above it: a bracket, an await, a non-null assertion, or a member or
// Call written on it. An argument or a callback body is not, since the value leaves the expression there
export const checkIsSubjectOfParent = (node: ts.Node): boolean => {
  const { parent } = node;
  if (ts.isPropertyAccessExpression(parent) || ts.isCallExpression(parent)) return parent.expression === node;
  return ts.isParenthesizedExpression(parent) || ts.isAwaitExpression(parent) || ts.isNonNullExpression(parent);
};
