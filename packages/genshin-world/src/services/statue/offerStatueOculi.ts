import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { offerItems } from "#src/services/offering/offerItems";

// The Worship Statue offers a started region the Oculi it holds: each level they complete is reached in turn, and the
// Rewards of each wait to be claimed one level at a time. A region not yet started is offered nothing, since a resonance
// Starts it
export const offerStatueOculi = (progress: OfferingProgress<StatueLevel>): OfferingProgress<StatueLevel> =>
  progress.level === 0 ? progress : offerItems(progress, []).progress;
