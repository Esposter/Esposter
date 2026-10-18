import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { offerItems } from "#src/services/offering/offerItems";
import { OCULUS_ADVENTURE_EXP } from "#src/services/statue/constants";

// Touching an Oculus collects it once: its id joins the found ids, and a found id gives nothing a second time, its Adventure
// EXP included, which the caller gains. In a Region already started the Oculus is offered at once, so the levels it
// Completes are returned for the caller to pay. In a region not yet started it is held in the region's count, since
// Offering it would start the region, which only a Resonance does
export const findOculus = (
  foundOculusIds: ReadonlySet<string>,
  oculusId: string,
  regionProgress: OfferingProgress<StatueLevel>,
): {
  adventureExp: number;
  foundOculusIds: ReadonlySet<string>;
  gainedLevels: StatueLevel[];
  progress: OfferingProgress<StatueLevel>;
} => {
  if (foundOculusIds.has(oculusId))
    return { adventureExp: 0, foundOculusIds, gainedLevels: [], progress: regionProgress };
  const nextFoundOculusIds = new Set([...foundOculusIds, oculusId]);
  if (regionProgress.level === 0)
    return {
      adventureExp: OCULUS_ADVENTURE_EXP,
      foundOculusIds: nextFoundOculusIds,
      gainedLevels: [],
      progress: { ...regionProgress, heldCount: regionProgress.heldCount + 1 },
    };
  const { gainedLevels, progress } = offerItems(regionProgress, 1);
  return { adventureExp: OCULUS_ADVENTURE_EXP, foundOculusIds: nextFoundOculusIds, gainedLevels, progress };
};
