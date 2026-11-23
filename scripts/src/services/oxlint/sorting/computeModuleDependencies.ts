import type { SortingGroupItem } from "#src/models/oxlint/sorting/SortingGroupItem";
import type { Context } from "@oxlint/plugins";

import { collectReadNames } from "#src/services/oxlint/sorting/collectReadNames";
import { checkIsClassOrEnumItem } from "#src/services/oxlint/sorting/computeModuleDependencies/checkIsClassOrEnumItem";
import { checkIsIgnoredReference } from "#src/services/oxlint/sorting/computeModuleDependencies/checkIsIgnoredReference";
import { computeRelatedNames } from "#src/services/oxlint/sorting/computeModuleDependencies/computeRelatedNames";

// Each item's dependencies are the names of the items it reads that sort ahead of it.
// A class or an enum reads another item by a reference resolving to it, or by a name it reaches through member access.
// Other declarations read nothing. The items are one partition's, so a dependency never crosses into another partition.
export const computeModuleDependencies = (context: Context, items: SortingGroupItem[]): SortingGroupItem[] => {
  if (!items.some((item) => checkIsClassOrEnumItem(item))) return items;
  const itemNames = new Set(items.map((item) => item.name));
  const namesByItem = collectReadNames(context, items, (referencingItem, reference, referencedItem) => {
    if (!checkIsClassOrEnumItem(referencingItem)) return [];
    const { identifier } = reference;
    return [
      ...(referencedItem !== undefined &&
      referencedItem !== referencingItem &&
      checkIsClassOrEnumItem(referencedItem) &&
      !checkIsIgnoredReference(referencingItem.node, identifier)
        ? [referencedItem.name]
        : []),
      ...computeRelatedNames(referencingItem.node, identifier).filter((name) => itemNames.has(name)),
    ];
  });
  return items.map((item) => ({ ...item, dependencies: namesByItem.get(item) ?? [] }));
};
