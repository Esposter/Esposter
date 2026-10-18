import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { offerItems } from "#src/services/offering/offerItems";
import { findStatueItemId } from "#src/services/statue/statueRegionProgress";

// Offers a region's collected Oculi at its Worship Statue: they join the count offered toward the next level, and each level
// The count then completes is reached in turn, returned in order for the caller to pay. Offering none reaches only the levels
// The count already held completes
export const offerCollectedOculi = (
  regionProgress: OfferingProgress<StatueLevel>,
  collectedCount: number,
): { gainedLevels: StatueLevel[]; progress: OfferingProgress<StatueLevel> } =>
  offerItems(
    regionProgress,
    collectedCount > 0 ? [{ itemCount: collectedCount, itemId: findStatueItemId(regionProgress.levels) }] : [],
  );
