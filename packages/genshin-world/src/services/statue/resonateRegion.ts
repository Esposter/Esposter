import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

// A resonance with one of a region's statues starts the region at level one, which takes no Oculi, so the Oculi the region
// Holds are left for the Worship Statue to offer. A region already started is left as it is
export const resonateRegion = (progress: OfferingProgress<StatueLevel>): OfferingProgress<StatueLevel> =>
  progress.level === 0 ? { ...progress, level: 1 } : progress;
