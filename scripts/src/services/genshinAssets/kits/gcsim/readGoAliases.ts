import type { GoAliasBinding } from "#src/models/genshinAssets/kits/gcsim/GoAliasBinding";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { getGoRootName } from "#src/services/genshinAssets/kits/gcsim/getGoRootName";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";

// The locals of a file that name a slice of another name, `for i, mult := range attack[c.NormalCounter]` or
// `mult := attack[0]`, each by every binding the name takes in the file, since a function may bind it again
export const readGoAliases = (tokens: readonly GoToken[]): Map<string, GoAliasBinding[]> => {
  const aliasMap = new Map<string, GoAliasBinding[]>();
  for (const [position, token] of tokens.entries()) {
    if (!checkIsGoPunctuation(token, ":=")) continue;
    const isRange = tokens[position + 1]?.text === "range";
    // A range is a control clause, so a bare name before its brace is the slice the loop body follows, not a composite
    const { expression } = parseGoExpression(tokens, position + (isRange ? 2 : 1), isRange);
    const rootName = getGoRootName(expression);
    const name = tokens[position - 1]?.text;
    if (rootName !== undefined && name !== undefined && tokens[position - 1]?.kind === GoTokenKind.Identifier)
      aliasMap.set(name, [...(aliasMap.get(name) ?? []), { position, rootName }]);
  }
  return aliasMap;
};
