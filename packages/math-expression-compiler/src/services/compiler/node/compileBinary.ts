import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";
import type { MathExpressionEvaluator } from "#src/models/compiler/MathExpressionEvaluator";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionBitwiseAbsorptionMap } from "#src/services/compiler/MathExpressionBitwiseAbsorptionMap";
import { checkIsPercentageExpression } from "#src/services/compiler/checkIsPercentageExpression";
import { getMathExpressionCompute } from "#src/services/compiler/getMathExpressionCompute";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

export const compileBinary = (
  node: Extract<MathExpressionNode, { type: MathExpressionNodeType.Binary }>,
  context: MathExpressionCompileContext,
): MathExpressionCompiled => {
  const { left, name, right } = node;
  const compiledLeft = context.compile(left);
  // X + y% is x + x * y / 100, unless x is a percentage expression, where the right side adds as a plain value
  const isAdditive = name === "add" || name === "subtract";
  if (isAdditive && right.type === MathExpressionNodeType.Percentage && !checkIsPercentageExpression(left)) {
    const compiledPercent = context.compile(right.operand);
    const sign = name === "add" ? 1 : -1;
    const evaluate: MathExpressionEvaluator = (values, locals) => {
      const base = compiledLeft.evaluate(values, locals);
      const percent = compiledPercent.evaluate(values, locals);
      if (base === null || percent === null) return null;
      return base + sign * base * (percent / 100);
    };
    return { evaluate, isConstant: compiledLeft.isConstant && compiledPercent.isConstant };
  }

  const compiledRight = context.compile(right);
  const compute = getMathExpressionCompute(name);
  const absorption = MathExpressionBitwiseAbsorptionMap[name];
  // A left operand that decides a bitwise operation answers it, and the right operand is never read, as in mathjs
  const evaluate: MathExpressionEvaluator = (values, locals) => {
    const leftValue = compiledLeft.evaluate(values, locals);
    if (leftValue === null) return null;
    if (absorption?.absorbs === leftValue) return absorption.result;

    const rightValue = compiledRight.evaluate(values, locals);
    if (rightValue === null) return null;
    return compute([leftValue, rightValue]);
  };
  return { evaluate, isConstant: compiledLeft.isConstant && compiledRight.isConstant };
};
