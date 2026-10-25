import type { GoAliasBinding } from "#src/models/genshinAssets/kits/gcsim/GoAliasBinding";

import { findAliasRoot } from "#src/services/genshinAssets/kits/gcsim/findAliasRoot";

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
