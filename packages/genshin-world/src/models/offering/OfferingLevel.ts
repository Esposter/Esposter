import type { OfferingLevelItem } from "#src/models/offering/OfferingLevelItem";
import type { OfferingReward } from "#src/models/offering/OfferingReward";

// One level of an offering, from the game's level-up table: the items it takes off the held counts, each kind counted
// Apart, and the rewards it pays. A level naming no item takes none, and level 1 is paid when the offering starts
export interface OfferingLevel {
  items: OfferingLevelItem[];
  level: number;
  rewards: OfferingReward[];
}
