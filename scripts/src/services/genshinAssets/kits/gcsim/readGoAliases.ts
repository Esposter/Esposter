import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { getGoRootName } from "#src/services/genshinAssets/kits/gcsim/getGoRootName";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";

// Each binding of a local name, where it is bound in the file's tokens and the name its right-hand side is rooted in
export interface GoAliasBinding {
  position: number;
  rootName: string;
}

// The locals of a file that name a slice of another name, `for i, mult := range attack[c.NormalCounter]` or
// `mult := attack[0]`, each by every binding the name takes in the file, since a function may bind it again
export const readGoAliases = (tokens: readonly GoToken[]): Map<string, GoAliasBinding[]> => {
  const aliasMap = new Map<string, GoAliasBinding[]>();
  for (const [position, token] of tokens.entries()) {
    if (!checkIsGoPunctuation(token, ":=")) continue;
    const isRange = tokens[position + 1]?.text === "range";
    const { expression } = parseGoExpression(tokens, position + (isRange ? 2 : 1));
    const rootName = getGoRootName(expression);
    const name = tokens[position - 1]?.text;
    if (rootName !== undefined && name !== undefined && tokens[position - 1]?.kind === GoTokenKind.Identifier)
      aliasMap.set(name, [...(aliasMap.get(name) ?? []), { position, rootName }]);
  }
  return aliasMap;
};

// The root a name takes at a token position: its nearest binding before it, else its first binding after it. Without a
// Position, the name's last binding in the file
const findAliasRoot = (
  aliasMap: ReadonlyMap<string, readonly GoAliasBinding[]>,
  name: string,
  position: number | undefined,
): string | undefined => {
  const bindings = aliasMap.get(name);
  if (bindings === undefined) return undefined;
  if (position === undefined) return bindings.at(-1)?.rootName;
  return (bindings.findLast((binding) => binding.position < position) ?? bindings[0])?.rootName;
};

// The name a local is rooted in at a token position, followed through the locals an alias names
export const resolveGoAlias = (
  aliasMap: ReadonlyMap<string, readonly GoAliasBinding[]>,
  name: string | undefined,
  position?: number,
): string | undefined => {
  let resolvedName = name;
  for (let depth = 0; resolvedName !== undefined && depth < 8; depth++) {
    const rootName = findAliasRoot(aliasMap, resolvedName, position);
    if (rootName === undefined) break;
    resolvedName = rootName;
  }
  return resolvedName;
};
