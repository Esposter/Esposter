import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";
import type { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

export const compilePercentage = (
  node: Extract<MathExpressionNode, { type: MathExpressionNodeType.Percentage }>,
  context: MathExpressionCompileContext,
): MathExpressionCompiled => {
  const compiledOperand = context.compile(node.operand);
  return {
    evaluate: (values, locals) => {
      const operandValue = compiledOperand.evaluate(values, locals);
      return operandValue === null ? null : operandValue / 100;
    },
    isConstant: compiledOperand.isConstant,
  };
};
