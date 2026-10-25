import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { getGoRootName } from "#src/services/genshinAssets/kits/gcsim/getGoRootName";

// The name of the first indexed frames in an expression, `skillEndFrames` in `delay + skillEndFrames[next] + skillHitmark`
export const findIndexedName = (expression: GoExpression): string | undefined => {
  if (expression.kind === GoExpressionKind.Index) return getGoRootName(expression);
  else if (expression.kind === GoExpressionKind.Binary)
    return findIndexedName(expression.left) ?? findIndexedName(expression.right);
  else return undefined;
};
