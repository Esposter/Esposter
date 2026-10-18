import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";
import type { MathExpressionEvaluator } from "#src/models/compiler/MathExpressionEvaluator";
import type { MathExpressionResult } from "#src/models/compiler/MathExpressionResult";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";
import type { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

import { getMathExpressionCompute } from "#src/services/compiler/getMathExpressionCompute";

export const compileComparison = (
  node: Extract<MathExpressionNode, { type: MathExpressionNodeType.Comparison }>,
  context: MathExpressionCompileContext,
): MathExpressionCompiled => {
  const compiledOperands = node.operands.map((operand) => context.compile(operand));
  const computes = node.names.map((name) => getMathExpressionCompute(name));
  // A chain holds only while each pair does, and a pair past the first false one is never read
  const evaluate: MathExpressionEvaluator = (values, locals) => {
    let left = compiledOperands[0]?.evaluate(values, locals) ?? null;
    let result: MathExpressionResult = 1;
    for (const [index, compute] of computes.entries()) {
      const right = compiledOperands[index + 1]?.evaluate(values, locals) ?? null;
      if (left === null || right === null) return null;
      result = compute([left, right]);
      if (result !== 1) return result;
      left = right;
    }
    return result;
  };
  return { evaluate, isConstant: compiledOperands.every((operand) => operand.isConstant) };
};
