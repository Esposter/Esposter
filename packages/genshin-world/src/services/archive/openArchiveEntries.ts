import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { ItemCategory } from "genshin-interface";

// The section a bag item opens an entry of, by its tab: a weapon opens its Equipment entry, and every other item its
// Materials entry. An artifact opens none, since an artifact set waits on the set its bag entries are not yet kept with
const getItemArchiveSection = (category: ItemCategory): ArchiveSection | undefined => {
  if (category === ItemCategory.Artifact) return undefined;
  return category === ItemCategory.Weapon ? ArchiveSection.Equipment : ArchiveSection.Materials;
};

// The progress with the entries of every item the bag holds opened. An entry is opened the first time its thing is
// Met and stays open, so opening one already held changes nothing. The progress given is left as it was
export const openArchiveEntries = (progress: ArchiveProgress, items: readonly InventoryItem[]): ArchiveProgress => {
  const openedIdsMap = new Map<ArchiveSection, Set<number>>(
    Array.from(progress, ([section, openedIds]): [ArchiveSection, Set<number>] => [section, new Set(openedIds)]),
  );
  for (const { definition } of items) {
    const section = getItemArchiveSection(definition.category);
    if (section === undefined) continue;
    const openedIds = openedIdsMap.get(section) ?? new Set<number>();
    openedIds.add(definition.id);
    openedIdsMap.set(section, openedIds);
  }

  return openedIdsMap;
};
