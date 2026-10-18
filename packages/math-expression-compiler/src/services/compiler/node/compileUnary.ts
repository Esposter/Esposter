import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";
import type { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

import { getMathExpressionCompute } from "#src/services/compiler/getMathExpressionCompute";

export const compileUnary = (
  node: Extract<MathExpressionNode, { type: MathExpressionNodeType.Unary }>,
  context: MathExpressionCompileContext,
): MathExpressionCompiled => {
  const compute = getMathExpressionCompute(node.name);
  const compiledOperand = context.compile(node.operand);
  return {
    evaluate: (values, locals) => {
      const operandValue = compiledOperand.evaluate(values, locals);
      return operandValue === null ? null : compute([operandValue]);
    },
    isConstant: compiledOperand.isConstant,
  };
};
