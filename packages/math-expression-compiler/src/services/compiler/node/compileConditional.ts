import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";
import type { MathExpressionEvaluator } from "#src/models/compiler/MathExpressionEvaluator";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";
import type { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

import { checkIsTruthy } from "#src/services/shared/checkIsTruthy";

export const compileConditional = (
  node: Extract<MathExpressionNode, { type: MathExpressionNodeType.Conditional }>,
  context: MathExpressionCompileContext,
): MathExpressionCompiled => {
  const compiledCondition = context.compile(node.condition);
  const compiledWhenTrue = context.compile(node.whenTrue);
  const compiledWhenFalse = context.compile(node.whenFalse);
  // Only the chosen branch is evaluated, and a condition that is NaN is false, as in mathjs
  const evaluate: MathExpressionEvaluator = (values, locals) => {
    const test = compiledCondition.evaluate(values, locals);
    if (test === null) return null;
    return checkIsTruthy(test) ? compiledWhenTrue.evaluate(values, locals) : compiledWhenFalse.evaluate(values, locals);
  };
  return {
    evaluate,
    isConstant: compiledCondition.isConstant && compiledWhenTrue.isConstant && compiledWhenFalse.isConstant,
  };
};
