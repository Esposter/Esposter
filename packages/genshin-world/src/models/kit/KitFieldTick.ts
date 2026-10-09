import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

// What a field's tick reads and writes: the character on the field and its combatant, the team's party and effects, and
// The tick's index from the field's first, which is zero
export interface KitFieldTick {
  activeCombatant: Combatant;
  kitEffectState: KitEffectState;
  party: Party;
  tickIndex: number;
}
