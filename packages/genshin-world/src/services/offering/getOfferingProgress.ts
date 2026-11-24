import type { OfferingKind } from "#src/models/offering/OfferingKind";
import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";

// An offering's progress as the save holds it, an offering the player has not offered to holding none: no count held
// And level zero, the level before its first
export const getOfferingProgress = (
  offeringProgressMap: ReadonlyMap<string, OfferingProgressSave>,
  offeringKind: OfferingKind,
): OfferingProgressSave => offeringProgressMap.get(offeringKind) ?? { heldCounts: {}, level: 0 };
