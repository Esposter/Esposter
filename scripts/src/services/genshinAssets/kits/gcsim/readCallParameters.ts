import type { GoScope } from "#src/models/genshinAssets/kits/gcsim/GoScope";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";

// The sets of values a method's parameters take at one call of it: each argument gives a number at the call's position,
// Or two where it is a local the clamp of the action's hold bounds to 0 and 1, so the call is one set per value
export const readCallParameters = (
  tokens: readonly GoToken[],
  scope: GoScope,
  site: number,
  parameters: readonly string[],
): Map<string, number>[] => {
  const call = parseGoExpression(tokens, site).expression;
  if (call.kind !== GoExpressionKind.Call) return [new Map()];
  return parameters.reduce<Map<string, number>[]>(
    (iterations, name, index) => {
      const argumentStart = call.parameterStarts[index];
      const values = argumentStart === undefined ? undefined : scope.readArgumentValues(site, argumentStart);
      if (values === undefined) return iterations;
      return iterations.flatMap((iteration) => values.map((value) => new Map(iteration).set(name, value)));
    },
    [new Map()],
  );
};
