import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";

export const getName = (expression: GoExpression | undefined): string | undefined =>
  expression?.kind === GoExpressionKind.Identifier ? expression.name : undefined;
