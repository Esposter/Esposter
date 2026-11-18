import type { AbyssBenedictionChoice } from "#src/models/spiralAbyss/AbyssBenedictionChoice";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";
import type { AbyssRewards } from "#src/models/spiralAbyss/AbyssRewards";

// The Spiral Abyss's tables as the game's dataset holds them, read together as its entrance first opens
export interface AbyssTables {
  // The Benedictions each chamber offers, by the chamber's id and then by the choice set
  benedictionChoices: Record<string, AbyssBenedictionChoice[][]>;
  // The enemy kinds of the Spiral Abyss, each with its count
  enemyKinds: Record<string, number>;
  floors: AbyssFloor[];
  periods: AbyssPeriod[];
  rewards: AbyssRewards;
}
