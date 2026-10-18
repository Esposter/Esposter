import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";
import type { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

// A number literal is a constant of its value
export const compileNumber = (
  node: Extract<MathExpressionNode, { type: MathExpressionNodeType.Number }>,
): MathExpressionCompiled => {
  const { value } = node;
  return { evaluate: () => value, isConstant: true };
};
