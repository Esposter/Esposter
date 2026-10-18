import type { KitSlotHitLabels } from "#src/models/genshinAssets/kits/tables/KitSlotHitLabels";
import type { KitSlotValueLabel } from "#src/models/genshinAssets/kits/tables/KitSlotValueLabel";

// The labels of a folder-less character's record reads from its tables, by each slot's path in the record: the hit slots
// And the other values, such as a stance's stamina or a duration
export interface KitSlotLabels {
  hits?: Record<string, KitSlotHitLabels>;
  values?: Record<string, KitSlotValueLabel>;
}
