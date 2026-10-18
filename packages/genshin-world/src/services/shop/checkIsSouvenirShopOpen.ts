import type { OfferingLevel } from "#src/models/offering/OfferingLevel";
import type { OfferingProgress } from "#src/models/offering/OfferingProgress";

// Whether a region's Souvenir Shop is open: only once the region's offering has reached its last level, as the game opens
// It from 2.0 on. Until then the shop is closed, whatever the player's Sigils
export const checkIsSouvenirShopOpen = (offering: OfferingProgress<OfferingLevel>): boolean =>
  offering.levels.length > 0 && offering.level >= Math.max(...offering.levels.map(({ level }) => level));
