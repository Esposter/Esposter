import type { Context, ESTree, Reference } from "@oxlint/plugins";

import { findNodeContaining } from "#src/services/oxlint/sorting/findNodeContaining";
import { getItemRange } from "#src/services/oxlint/sorting/getItemRange";
import { getReferencesWithin } from "#src/services/oxlint/sorting/getReferencesWithin";

// The names each item reads, gathered over the references the file's scopes make inside the items. `readNames` is given
// The item a reference sits in, the reference, and the item its declaration sits in when that is one of the items
export const collectReadNames = <T extends { node: ESTree.Node }>(
  context: Context,
  items: T[],
  readNames: (referencingItem: T, reference: Reference, referencedItem: T | undefined) => string[],
): Map<T, string[]> => {
  const itemNamesMap = new Map<T, string[]>();
  const itemRanges = items.map((item) => ({ item, range: getItemRange(context, item.node) }));
  for (const reference of getReferencesWithin(context, items)) {
    const { identifier, resolved } = reference;
    if (!resolved) continue;
    const referencingItem = findNodeContaining(itemRanges, identifier.range);
    if (referencingItem === undefined) continue;
    const [declaration] = resolved.identifiers;
    const referencedItem = declaration ? findNodeContaining(itemRanges, declaration.range) : undefined;
    const names = itemNamesMap.get(referencingItem) ?? [];
    names.push(...readNames(referencingItem, reference, referencedItem));
    itemNamesMap.set(referencingItem, names);
  }
  return itemNamesMap;
};
