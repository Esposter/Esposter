import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";

// Whether a token starts a clause of a switch, a `case` or a `default`
export const checkIsSwitchClause = (token: GoToken): boolean =>
  token.kind === GoTokenKind.Identifier && (token.text === "case" || token.text === "default");
