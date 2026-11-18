import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

import { OfferingKind } from "#src/models/offering/OfferingKind";
import { readOfferingLevels } from "#src/services/offering/readOfferingLevels";

// The Frostbearing Tree's levels, which the world's gate reads as it opens
export const readFrostbearingTreeLevels = (gameDataBaseUrl: string): Promise<OfferingLevel[]> =>
  readOfferingLevels(gameDataBaseUrl, OfferingKind.FrostbearingTree);
