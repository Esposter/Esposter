import type { Element } from "#src/models/Element";
import type { EnemyDropFamily } from "#src/models/enemy/EnemyDropFamily";
import type { EnergyDrop } from "#src/models/enemy/EnergyDrop";
import type { PoiseType } from "#src/models/enemy/PoiseType";

// What the wiki gives of a kind that the game's monster table does not: its poise, the energy it drops, and the
// Family whose Mora and materials it drops, none for a boss, whose reward is claimed instead. Its element is the
// Element its energy carries, none for an enemy whose energy is clear. Its attack element is the Element its attacks
// Carry, none for an enemy whose attacks are all physical
export interface EnemyKindTraits {
  attackElement?: Element;
  element?: Element;
  enemyDropFamily?: EnemyDropFamily;
  energyDrops: EnergyDrop[];
  poiseType: PoiseType;
  // The boss's own drop its Trounce Blossom pays, none for a kind that leaves no blossom
  uniqueDropId?: number;
}
