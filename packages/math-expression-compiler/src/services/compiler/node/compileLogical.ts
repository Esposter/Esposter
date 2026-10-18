import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";
import type { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

import { MathExpressionLogicalOperator } from "#src/models/shared/MathExpressionLogicalOperator";
import { checkIsTruthy } from "#src/services/shared/checkIsTruthy";
import { toNumber } from "#src/services/shared/toNumber";
import { exhaustiveGuard } from "@esposter/shared";

export const compileLogical = (
  node: Extract<MathExpressionNode, { type: MathExpressionNodeType.Logical }>,
  context: MathExpressionCompileContext,
): MathExpressionCompiled => {
  const compiledLeft = context.compile(node.left);
  // A nullish takes its left side over numbers, so its right side, which nothing evaluates, is not compiled
  if (node.operator === MathExpressionLogicalOperator.Nullish) return compiledLeft;

  const compiledRight = context.compile(node.right);
  const isConstant = compiledLeft.isConstant && compiledRight.isConstant;
  switch (node.operator) {
    case MathExpressionLogicalOperator.And:
      return {
        evaluate: (values, locals) => {
          const leftValue = compiledLeft.evaluate(values, locals);
          if (leftValue === null) return null;
          if (!checkIsTruthy(leftValue)) return 0;
          const rightValue = compiledRight.evaluate(values, locals);
          return rightValue === null ? null : toNumber(checkIsTruthy(rightValue));
        },
        isConstant,
      };
    case MathExpressionLogicalOperator.Or:
      return {
        evaluate: (values, locals) => {
          const leftValue = compiledLeft.evaluate(values, locals);
          if (leftValue === null) return null;
          if (checkIsTruthy(leftValue)) return 1;
          const rightValue = compiledRight.evaluate(values, locals);
          return rightValue === null ? null : toNumber(checkIsTruthy(rightValue));
        },
        isConstant,
      };
    default:
      return exhaustiveGuard(node.operator);
  }
};
