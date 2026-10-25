import type { GoScope } from "#src/models/genshinAssets/kits/gcsim/GoScope";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";

// The position a queue call's attack pattern is read from: the argument itself, or where its bare local was assigned in
// The call's own function, as `ap := combat.NewCircleHitOnTarget(...)` is passed as `ap`, else none
export const readHitboxStart = (
  tokens: readonly GoToken[],
  start: number,
  position: number,
  scope: GoScope,
): number | undefined => {
  const expression = parseGoExpression(tokens, start).expression;
  return expression.kind === GoExpressionKind.Identifier ? scope.resolveAssignment(expression.name, position) : start;
};
