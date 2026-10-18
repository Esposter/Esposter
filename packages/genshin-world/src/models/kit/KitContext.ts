import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { OreStrike } from "#src/models/gathering/OreStrike";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitReactionTrigger } from "#src/models/kit/KitReactionTrigger";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { Party } from "#src/models/party/Party";
import type { Wildlife } from "#src/models/wildlife/Wildlife";
import type { LocomotionState, Stamina } from "genshin-engine";

// The world's combat state, which every call of a kit reads and writes: built once by useWorldCombat and written in
// Place each step, it holds the character on the field as its combatant and the body it stands as, every built
// Combatant of the deployed team by its id, the enemies with the tables they are priced by, the effects on the team, the
// Events raised outside a kit's own calls, which the step sends in the order they were raised, the deployed team's
// Party, and the world's one seeded random source, so the world plays the same under the same seed. The step's own
// Lists, the effects that ran out on it, the ores its reactions strike and the strikes it lands, are kept here too and
// Emptied by their length, so a step where nothing lands makes nothing
export interface KitContext {
  activeCombatant: Combatant;
  body: KitBody;
  characterIdCombatantMap: Map<number, Combatant>;
  enemyMap: Map<string, Enemy>;
  enemyTables: EnemyTables;
  // The effects that ran out on the step, which it sends as expired and bursts the Dendro Cores of
  expiredEffects: KitEffect[];
  kitEffectState: KitEffectState;
  // The active character's locomotion state as the step's input gives it, which a kit reads to tell a dash or a jump from standing
  locomotionState: LocomotionState;
  // The character controller's stamina pool, which the team's kits spend from and a kit's effect restores to, written each step
  stamina: Stamina;
  // The ores the step's reactions strike, each from where its reaction landed, sent once its strikes have landed
  oreStrikes: OreStrike[];
  // The reactions the step's hits and ticks triggered on enemies, sent to the world once the step's strikes have landed
  reactionTriggers: KitReactionTrigger[];
  // The events raised outside a kit's own calls: between steps, as a taunt is struck, and as the enemies' statuses tick
  outbox: KitEvent[];
  party: Party;
  // Where the drops a struck animal gives lie, given the animal and the drops it gives
  placeWildlifeDrops: (wildlife: Wildlife, droppedItems: DroppedItem[]) => void;
  random: () => number;
  // The strikes the step lands, the summons' and then its own, which keep only those that struck an enemy once struck
  strikes: KitStrike[];
  // The birds and beasts in the world, each struck down by a hit its area reaches, as the enemies are
  wildlifeList: Wildlife[];
}
