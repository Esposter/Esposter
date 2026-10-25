import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";

// Whether the tokens at the position are a struct copy of an attack variable, `aiC2 = ai` or `aiC2 := ai`, its source
// Name ending its statement, which a `.` or a call or index on it would not
export const readCopySource = (tokens: readonly GoToken[], position: number): string | undefined => {
  const source = tokens[position + 2];
  const isCopy =
    tokens[position]?.kind === GoTokenKind.Identifier &&
    !checkIsGoPunctuation(tokens[position - 1], ".") &&
    (checkIsGoPunctuation(tokens[position + 1], "=") || checkIsGoPunctuation(tokens[position + 1], ":=")) &&
    source?.kind === GoTokenKind.Identifier &&
    source.line === tokens[position]?.line &&
    (tokens[position + 3] === undefined || tokens[position + 3]?.kind === GoTokenKind.Newline);
  return isCopy ? source.text : undefined;
};
