import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

// What a field's tick reads and writes: the character on the field and its combatant, the enemies on the field, every built
// Combatant of the deployed team by its id, which a field counts its members' elements from, the team's party and effects,
// And the tick's index from the field's first, which is zero
export interface KitFieldTick {
  activeCombatant: Combatant;
  characterIdCombatantMap: Map<number, Combatant>;
  enemyMap: Map<string, Enemy>;
  kitEffectState: KitEffectState;
  party: Party;
  tickIndex: number;
}
