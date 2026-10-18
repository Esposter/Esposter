import type { ElementalState } from "#src/models/combat/ElementalState";
import type { InternalCooldown } from "#src/models/combat/InternalCooldown";
import type { Reaction } from "#src/models/combat/Reaction";
import type { EnemyKindTraits } from "#src/models/enemy/EnemyKindTraits";
import type { EnemyState } from "#src/models/enemy/EnemyState";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { MoondriftHarmonyHit } from "#src/models/enemy/MoondriftHarmonyHit";
import type { Combatant } from "#src/models/kit/Combatant";
import type { GroundPoint } from "genshin-engine";

// One enemy in the world as its AI moves it, written in place each step: its kind and level, its camp and spawn,
// Where it stands and faces, in radians about the vertical from south, its health and poise, its state and how long it
// Has held it, how long until it may attack again, how long its broken poise has left, which patrol point it walks to,
// How many of its energy thresholds it has dropped, its elements and the internal cooldowns each attacker's tags and
// Reactions keep on it, beside the ones each reaction keeps whatever its source, the seconds since it was last hit, and
// The Moondrift Harmony hits on their way to it
export interface Enemy {
  attackCooldownSeconds: number;
  // The combatant whose Pyro or Dendro last lit or fed its Burning, as its hit priced it, which the Burning ticks are
  // Priced from, none until one has
  burningCombatant?: Combatant;
  campId: string;
  droppedThresholdCount: number;
  // The combatant whose Electro or Hydro last left it Electro-Charged, as its hit priced it, which the ticks are priced
  // From, none until one has
  electroChargedCombatant?: Combatant;
  // The reactions its elements brought on their own as they aged, held until the kit on the field prices them
  elementalReactions: Reaction[];
  elementalState: ElementalState;
  enemyKindId: number;
  heading: number;
  health: number;
  hitSeconds: number;
  home: GroundPoint;
  id: string;
  internalCooldownMap: Map<string, InternalCooldown>;
  level: number;
  maxHealth: number;
  moondriftHarmonyHits: MoondriftHarmonyHit[];
  patrol: GroundPoint[];
  patrolIndex: number;
  poise: number;
  poiseBrokenSeconds: number;
  position: GroundPoint;
  state: EnemyState;
  stateSeconds: number;
  statuses: EnemyStatus[];
  // The traits its kind has, as the traits map writes them or its family's defaults give them, fixed when it is created
  traits: EnemyKindTraits;
}
