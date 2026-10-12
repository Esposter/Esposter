import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";

// The name an expression is rooted in, `attack` for `attack[c.NormalCounter][i]`
export const getGoRootName = (expression: GoExpression): string | undefined => {
  if (expression.kind === GoExpressionKind.Identifier) return expression.name;
  else if (expression.kind === GoExpressionKind.Index) return getGoRootName(expression.target);
  else return undefined;
};
