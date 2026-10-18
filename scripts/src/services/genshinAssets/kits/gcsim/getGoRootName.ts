import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";

// The name an expression is rooted in, `attack` for `attack[c.NormalCounter][i]`, and for a slice scaled by a product,
// `burstBloom` for `burstBloom[level] * .2`, the left side first
export const getGoRootName = (expression: GoExpression): string | undefined => {
  if (expression.kind === GoExpressionKind.Identifier) return expression.name;
  else if (expression.kind === GoExpressionKind.Index) return getGoRootName(expression.target);
  else if (expression.kind === GoExpressionKind.Binary && (expression.operator === "*" || expression.operator === "/"))
    return getGoRootName(expression.left) ?? getGoRootName(expression.right);
  else return undefined;
};
