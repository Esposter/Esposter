import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { Party } from "#src/models/party/Party";

// The world's combat state, which every call of a kit reads and writes: built once by useWorldCombat and written in
// Place each step, it holds the character on the field as its combatant and the body it stands as, every built
// Combatant of the deployed team by its id, the enemies with the tables they are priced by, the effects on the team, the
// Events raised between steps, which the next step sends first, the deployed team's party, and the world's one seeded
// Random source, so the world plays the same under the same seed
export interface KitContext {
  activeCombatant: Combatant;
  body: KitBody;
  characterIdCombatantMap: Map<number, Combatant>;
  enemyMap: Map<string, Enemy>;
  enemyTables: EnemyTables;
  kitEffectState: KitEffectState;
  outbox: KitEvent[];
  party: Party;
  random: () => number;
}
