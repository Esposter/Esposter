import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

// What a field's tick reads and writes: the character on the field and its combatant, the enemies on the field, the team's
// Party and effects, and the tick's index from the field's first, which is zero
export interface KitFieldTick {
  activeCombatant: Combatant;
  enemyMap: Map<string, Enemy>;
  kitEffectState: KitEffectState;
  party: Party;
  tickIndex: number;
}
