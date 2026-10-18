import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { offerItems } from "#src/services/offering/offerItems";

// A resonance with one of a region's statues starts the region at level one, which takes no Oculi, so it offers none. The
// Oculi the region has collected stay collected until its Worship Statue offers them. A region already started is left as it
// Is, so its first level's rewards are paid once
export const resonateRegion = (
  progress: OfferingProgress<StatueLevel>,
): { gainedLevels: StatueLevel[]; progress: OfferingProgress<StatueLevel> } =>
  progress.level === 0 ? offerItems(progress, []) : { gainedLevels: [], progress };
