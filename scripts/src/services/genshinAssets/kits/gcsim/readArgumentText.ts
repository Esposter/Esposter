import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";

export const readArgumentText = (tokens: readonly GoToken[], start: number): string => {
  const end = parseGoExpression(tokens, start).end;
  return tokens
    .slice(start, end)
    .filter(({ kind }) => kind !== GoTokenKind.Newline)
    .map(({ text }) => text)
    .join("");
};
