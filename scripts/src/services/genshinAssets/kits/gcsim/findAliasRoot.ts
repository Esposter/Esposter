import type { GoAliasBinding } from "#src/models/genshinAssets/kits/gcsim/GoAliasBinding";

// The root a name takes at a token position: its nearest binding before it, else its first binding after it. Without a
// Position, the name's last binding in the file
export const findAliasRoot = (
  aliasMap: ReadonlyMap<string, readonly GoAliasBinding[]>,
  name: string,
  position: number | undefined,
): string | undefined => {
  const bindings = aliasMap.get(name);
  if (bindings === undefined) return undefined;
  if (position === undefined) return bindings.at(-1)?.rootName;
  return (bindings.findLast((binding) => binding.position < position) ?? bindings[0])?.rootName;
};
