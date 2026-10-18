import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { offerItems } from "#src/services/offering/offerItems";

// Touching an Oculus collects it once: its id joins the found ids, and a found id gives nothing a second time. In a
// Region already started the Oculus is offered at once, so the levels it completes are returned for the caller to pay.
// In a region not yet started it is held in the region's count, since offering it would start the region, which only a
// Resonance does
export const findOculus = (
  foundOculusIds: ReadonlySet<string>,
  oculusId: string,
  regionProgress: OfferingProgress<StatueLevel>,
): { foundOculusIds: ReadonlySet<string>; gainedLevels: StatueLevel[]; progress: OfferingProgress<StatueLevel> } => {
  if (foundOculusIds.has(oculusId)) return { foundOculusIds, gainedLevels: [], progress: regionProgress };
  const nextFoundOculusIds = new Set([...foundOculusIds, oculusId]);
  if (regionProgress.level === 0)
    return {
      foundOculusIds: nextFoundOculusIds,
      gainedLevels: [],
      progress: { ...regionProgress, heldCount: regionProgress.heldCount + 1 },
    };
  const { gainedLevels, progress } = offerItems(regionProgress, 1);
  return { foundOculusIds: nextFoundOculusIds, gainedLevels, progress };
};
