import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";

// The values a gcsim action's hold takes, `min(max(p["hold"], 0), 1)` taking 0 for the press and 1 for the hold: the
// Lookup's own value is unknown, but the clamp bounds it to 0 and 1. Only that clamp on the `hold` key has this shape,
// Else Undefined
export const readClampValues = (expression: GoExpression): number[] | undefined => {
  if (expression.kind !== GoExpressionKind.Call || expression.callee !== "min" || expression.parameters.length !== 2)
    return undefined;
  const [inner, upper] = expression.parameters;
  if (inner?.kind !== GoExpressionKind.Call || inner.callee !== "max" || inner.parameters.length !== 2)
    return undefined;
  const [lookup, lower] = inner.parameters;
  if (
    lookup?.kind !== GoExpressionKind.Index ||
    lookup.target.kind !== GoExpressionKind.Identifier ||
    lookup.target.name !== "p" ||
    lookup.index.kind !== GoExpressionKind.String ||
    lookup.index.value !== "hold" ||
    lower?.kind !== GoExpressionKind.Number ||
    lower.value !== 0 ||
    upper?.kind !== GoExpressionKind.Number ||
    upper.value !== 1
  )
    return undefined;
  return [0, 1];
};
