import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

// What a kit reads and writes as an event reaches it: its own character as its combatant, whose ascension and
// Constellation count gate what it answers, the character on the field and the body it stands as, the enemies, the
// Deployed team, the effects on the team and the world's one seeded random source
export interface KitEventContext {
  activeCombatant: Combatant;
  body: KitBody;
  combatant: Combatant;
  enemyMap: Map<string, Enemy>;
  kitEffectState: KitEffectState;
  party: Party;
  random: () => number;
}
