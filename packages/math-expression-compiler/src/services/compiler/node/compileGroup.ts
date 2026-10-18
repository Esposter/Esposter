import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";
import type { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

// A parenthesised group is its operand
export const compileGroup = (
  node: Extract<MathExpressionNode, { type: MathExpressionNodeType.Group }>,
  context: MathExpressionCompileContext,
): MathExpressionCompiled => context.compile(node.operand);
