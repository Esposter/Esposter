import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

// Whether a region's Souvenir Shop is open: only once the region's offering has reached the last of the levels the game's table
// Holds, as the game opens it from 2.0 on. Until then the shop is closed, whatever the player's Sigils, and so is one whose table holds none
export const checkIsSouvenirShopOpen = (level: number, levels: readonly OfferingLevel[]): boolean =>
  levels.length > 0 && level >= Math.max(...levels.map((offeringLevel) => offeringLevel.level));
