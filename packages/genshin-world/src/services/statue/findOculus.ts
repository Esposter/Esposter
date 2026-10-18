import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { OCULUS_ADVENTURE_EXP } from "#src/services/statue/constants";
import { findStatueItemId } from "#src/services/statue/statueRegionProgress";

// Touching an Oculus collects it once: its id joins the found ids, and a found id gives nothing a second time, its Adventure
// EXP included. The Oculus is held in its region's count whether or not the region is started, since offering it is the
// Worship Statue's act, and a region's levels are reached only by an offer or by a resonance
export const findOculus = (
  foundOculusIds: ReadonlySet<string>,
  oculusId: string,
  regionProgress: OfferingProgress<StatueLevel>,
): { adventureExp: number; foundOculusIds: ReadonlySet<string>; progress: OfferingProgress<StatueLevel> } => {
  if (foundOculusIds.has(oculusId)) return { adventureExp: 0, foundOculusIds, progress: regionProgress };
  const itemId = findStatueItemId(regionProgress.levels);
  return {
    adventureExp: OCULUS_ADVENTURE_EXP,
    foundOculusIds: new Set([...foundOculusIds, oculusId]),
    progress: {
      ...regionProgress,
      heldCounts: { ...regionProgress.heldCounts, [itemId]: (regionProgress.heldCounts[itemId] ?? 0) + 1 },
    },
  };
};
