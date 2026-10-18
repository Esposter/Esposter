import type { ItemCount } from "#src/models/inventory/ItemCount";

import { ItemIdExperienceMap } from "#src/services/artifact/ItemIdExperienceMap";

// The Artifact EXP the enhancement materials among a set of item counts give, each material's EXP times its count
export const getMaterialExperience = (itemCounts: readonly ItemCount[]): number =>
  itemCounts.reduce((total, { count, id }) => total + (ItemIdExperienceMap.get(id) ?? 0) * count, 0);
