import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { getGoRootName } from "#src/services/genshinAssets/kits/gcsim/getGoRootName";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";

// The locals of a file that name a slice of another name, `for i, mult := range attack[c.NormalCounter]` or
// `mult := attack[0]`, each by the name it is rooted in
export const readGoAliases = (tokens: readonly GoToken[]): Map<string, string> => {
  const aliasMap = new Map<string, string>();
  for (const [position, token] of tokens.entries()) {
    if (!checkIsGoPunctuation(token, ":=")) continue;
    const isRange = tokens[position + 1]?.text === "range";
    const { expression } = parseGoExpression(tokens, position + (isRange ? 2 : 1));
    const rootName = getGoRootName(expression);
    const name = tokens[position - 1]?.text;
    if (rootName !== undefined && name !== undefined && tokens[position - 1]?.kind === GoTokenKind.Identifier)
      aliasMap.set(name, rootName);
  }
  return aliasMap;
};

// The name a local is rooted in, followed through the locals an alias names
export const resolveGoAlias = (aliasMap: ReadonlyMap<string, string>, name: string | undefined): string | undefined => {
  let resolvedName = name;
  for (let depth = 0; resolvedName !== undefined && aliasMap.has(resolvedName) && depth < 8; depth++)
    resolvedName = aliasMap.get(resolvedName);
  return resolvedName;
};
