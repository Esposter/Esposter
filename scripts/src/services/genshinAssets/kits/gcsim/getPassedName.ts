import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";

// The name a call's first argument passes its `AttackInfo` by, the last segment of `ai`, `c.skillAttackInfo` or
// `c.a1AttackInfo()`
export const getPassedName = (expression: GoExpression): string | undefined => {
  if (expression.kind === GoExpressionKind.Identifier) return expression.name.split(".").at(-1);
  else if (expression.kind === GoExpressionKind.Call) return expression.callee.split(".").at(-1);
  else return undefined;
};
