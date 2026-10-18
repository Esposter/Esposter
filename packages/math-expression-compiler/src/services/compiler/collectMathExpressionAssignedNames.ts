import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { getMathExpressionChildren } from "#src/services/shared/getMathExpressionChildren";

// Adds the name of every assignment in the tree to names
export const collectMathExpressionAssignedNames = (node: MathExpressionNode, names: Set<string>): void => {
  if (node.type === MathExpressionNodeType.Assignment) names.add(node.name);
  for (const child of getMathExpressionChildren(node)) collectMathExpressionAssignedNames(child, names);
};
