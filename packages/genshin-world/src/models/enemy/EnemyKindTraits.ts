import type { Element } from "#src/models/Element";
import type { EnergyDrop } from "#src/models/enemy/EnergyDrop";
import type { PoiseType } from "#src/models/enemy/PoiseType";

// What the wiki gives of a kind: its poise and the energy it drops. The game's monster table holds the health
// Thresholds each drop falls at (its hpDrops), but not which drop is an energy particle: the drop tables that name
// The items are not in the dump, so the wiki gives which drop is energy. Its element is The Element its energy carries,
// None for an enemy whose energy is clear. Its attack element is the Element its attacks Carry, None for an enemy whose
// Attacks are all physical
export interface EnemyKindTraits {
  attackElement?: Element | undefined;
  element?: Element | undefined;
  energyDrops: EnergyDrop[];
  // Whether the kind is immune to Air staggers, so a launching hit that staggers it leaves it on the ground
  isAirStaggerImmune?: true;
  poiseType: PoiseType;
  // The share of its max HP the shield a kind holds on top of its health has, none for a kind with no shield
  shieldHealthFraction?: number;
  // The boss's own drop its Trounce Blossom pays, none for a kind that leaves no blossom
  uniqueDropId?: number;
}
