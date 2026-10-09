import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

// A heal a hit may give the whole party as it strikes an enemy, while its striker's character holds a shield: each roll
// Passes at its chance, which the striker's constellations and the team's effects may raise, and the heal is a flat
// Amount of HP plus a share of the striker's DEF, to each member's Max HP
export interface KitPartyHeal {
  chance: (striker: Combatant, effects: readonly KitEffect[]) => number;
  defenseShare: number;
  flatHealth: number;
}
