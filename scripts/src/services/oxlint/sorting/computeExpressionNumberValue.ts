import type { ESTree } from "@oxlint/plugins";

import { computeBinaryNumberValue } from "#src/services/oxlint/sorting/computeExpressionNumberValue/computeBinaryNumberValue";
import { computeUnaryNumberValue } from "#src/services/oxlint/sorting/computeExpressionNumberValue/computeUnaryNumberValue";

// The number an enum member's initializer evaluates to from literals alone, or undefined when a name or a call is in it
export const computeExpressionNumberValue = (expression: ESTree.Node): number | undefined => {
  switch (expression.type) {
    case "BinaryExpression": {
      const left = computeExpressionNumberValue(expression.left);
      const right = computeExpressionNumberValue(expression.right);
      return left === undefined || right === undefined
        ? undefined
        : computeBinaryNumberValue(expression.operator, left, right);
    }
    case "Literal":
      return typeof expression.value === "number" ? expression.value : undefined;
    case "UnaryExpression": {
      const argument = computeExpressionNumberValue(expression.argument);
      return argument === undefined ? undefined : computeUnaryNumberValue(expression.operator, argument);
    }
    default:
      return undefined;
  }
};
