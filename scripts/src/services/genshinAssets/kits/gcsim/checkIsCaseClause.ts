import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";

export const checkIsCaseClause = (token: GoToken | undefined): boolean =>
  token?.kind === GoTokenKind.Identifier && (token.text === "case" || token.text === "default");
