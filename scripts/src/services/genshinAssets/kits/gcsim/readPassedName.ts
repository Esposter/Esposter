import type { GoNamedFunction } from "#src/models/genshinAssets/kits/gcsim/GoNamedFunction";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { findInlineAttackPosition } from "#src/services/genshinAssets/kits/gcsim/findInlineAttackPosition";
import { getPassedName } from "#src/services/genshinAssets/kits/gcsim/getPassedName";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readVisibleBindingValue } from "#src/services/genshinAssets/kits/gcsim/readVisibleBindingValue";

// The name a call's first argument passes its attack by. A local is read as the value its binding in scope gives it: a
// Call's callee, which the method or function returns, a field's name, else its own name, as a literal or a copy is
// Named. A value that is none of these passes no name, so the call fires no known attack
export const readPassedName = (
  tokens: readonly GoToken[],
  namedFunctions: readonly GoNamedFunction[],
  start: number,
  position: number,
): string | undefined => {
  const expression = parseGoExpression(tokens, start).expression;
  if (expression.kind !== GoExpressionKind.Identifier || expression.name.includes("."))
    return getPassedName(expression);
  const valueStart = readVisibleBindingValue(tokens, namedFunctions, expression.name, position);
  if (valueStart === undefined || findInlineAttackPosition(tokens, valueStart) !== undefined) return expression.name;
  const value = parseGoExpression(tokens, valueStart).expression;
  if (value.kind === GoExpressionKind.Identifier)
    return value.name.includes(".") ? getPassedName(value) : expression.name;
  return value.kind === GoExpressionKind.Call ? getPassedName(value) : undefined;
};
