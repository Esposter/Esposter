import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

// A heal a hit may give the whole party as it strikes an enemy: each roll passes at its chance, which the striker's
// Ascension, constellations and the team's effects may set, and the heal is a flat amount of HP plus shares of the
// Striker's ATK and DEF, to each member's Max HP. It rolls only while its striker's character holds a shield, unless it
// Is unshielded
export interface KitPartyHeal {
  // The share of the striker's ATK the heal adds, if it scales with ATK
  attackShare?: number;
  chance: (striker: Combatant, effects: readonly KitEffect[]) => number;
  defenseShare: number;
  flatHealth: number;
  // Whether the heal rolls whether or not its striker's character holds a shield
  isUnshielded?: true;
}
