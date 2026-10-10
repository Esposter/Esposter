import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { OreHit } from "#src/models/gathering/OreHit";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { Party } from "#src/models/party/Party";
import type { CharacterController } from "genshin-engine";

// What the step of the kit on the field reads and writes beyond its input: the body it acts from and turns, the deployed
// Team and each member's combat, the enemies it strikes with the tables they are priced by, the effects on the team, and
// The world's one seeded random source
export interface ActiveKitStepContext {
  // The yaw the camera aims along, which an aimed shot turns the body to while the aim is held
  aimYaw: number;
  characterController: CharacterController;
  characterIdCombatantMap: Map<number, Combatant>;
  enemyMap: Map<string, Enemy>;
  enemyTables: EnemyTables;
  isAimHeld: boolean;
  kitEffectState: KitEffectState;
  // The buffer the step's landed hits are written into, emptied once they have struck
  landedHits: KitHit[];
  party: Party;
  random: () => number;
  // An ore struck by a hit the step landed, from the body it landed from
  strikeOre: (body: KitBody, hit: OreHit) => void;
}
