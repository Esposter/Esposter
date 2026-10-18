import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";
import type { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

import { getMathExpressionConstant } from "#src/services/compiler/getMathExpressionConstant";

export const compileName = (
  node: Extract<MathExpressionNode, { type: MathExpressionNodeType.Name }>,
  context: MathExpressionCompileContext,
): MathExpressionCompiled => {
  // An assigned name reads the slot, which starts at its outer value, so it reads that until its assignment runs
  const slot = context.assignedSlots.get(node.name);
  if (slot !== undefined) return { evaluate: (_values, locals) => locals[slot] ?? null, isConstant: false };

  const index = context.variableIndices.get(node.name);
  if (index !== undefined) return { evaluate: (values) => values[index] ?? Number.NaN, isConstant: false };
  // A name that is neither a variable, an assignment nor a constant is an error, not a value
  const constant = getMathExpressionConstant(node.name);
  return { evaluate: () => constant ?? null, isConstant: true };
};
