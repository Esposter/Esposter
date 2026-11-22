import type { FamilyLabelMatch } from "#src/models/genshinAssets/camps/FamilyLabelMatch";
import type { FamilyLabelUnmapped } from "#src/models/genshinAssets/camps/FamilyLabelUnmapped";

export interface FamilyLabelMap {
  matches: FamilyLabelMatch[];
  unmapped: FamilyLabelUnmapped[];
}
