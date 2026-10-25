import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";

// The local names an expression reads, `cd` in `c.a4CD(c.a1(cd))`, its callees and selectors left out
export const readGoNames = (expression: GoExpression): string[] => {
  switch (expression.kind) {
    case GoExpressionKind.Binary:
      return [...readGoNames(expression.left), ...readGoNames(expression.right)];
    case GoExpressionKind.Call:
      return expression.parameters.flatMap((parameter) => readGoNames(parameter));
    case GoExpressionKind.Identifier:
      return [expression.name];
    case GoExpressionKind.Index:
      return [...readGoNames(expression.target), ...readGoNames(expression.index)];
    case GoExpressionKind.Unary:
      return readGoNames(expression.operand);
    default:
      return [];
  }
};
