import type { MathExpressionNode } from "#src/models/mathExpression/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/mathExpression/MathExpressionNodeType";
import { getMathExpressionChildren } from "#src/services/mathExpression/getMathExpressionChildren";
import { MathExpressionConstantMap } from "#src/services/mathExpression/MathExpressionConstantMap";

const collectNames = (node: MathExpressionNode, read: Set<string>, assigned: Set<string>): void => {
  if (node.type === MathExpressionNodeType.Name) read.add(node.name);
  if (node.type === MathExpressionNodeType.Assignment) assigned.add(node.name);
  for (const child of getMathExpressionChildren(node)) collectNames(child, read, assigned);
};

// The column names a formula reads: every name it reads that it does not assign itself and that is not a constant of
// Mathjs's, so the edit form can check each one is a column before the formula is saved
export const getMathExpressionNames = (node: MathExpressionNode): string[] => {
  const read = new Set<string>();
  const assigned = new Set<string>();
  collectNames(node, read, assigned);
  return [...read].filter((name) => !assigned.has(name) && !Object.hasOwn(MathExpressionConstantMap, name));
};
