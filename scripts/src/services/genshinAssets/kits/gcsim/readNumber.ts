import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";

export const readNumber = (
  tokens: readonly GoToken[],
  start: number,
  resolveName: (name: string) => GoValue | undefined,
): number | undefined => evaluateGoNumber(parseGoExpression(tokens, start).expression, resolveName);
