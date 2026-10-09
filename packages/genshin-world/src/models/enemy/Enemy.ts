import type { ElementalState } from "#src/models/combat/ElementalState";
import type { InternalCooldown } from "#src/models/combat/InternalCooldown";
import type { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import type { EnemyState } from "#src/models/enemy/EnemyState";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { GroundPoint } from "genshin-engine";

// One enemy in the world as its AI moves it, written in place each step: its kind and level, its camp and spawn,
// Where it stands and faces, in radians about the vertical from south, its health and poise, its state and how long it
// Has held it, how long until it may attack again, how long its broken poise has left, which patrol point it walks to,
// How many of its energy thresholds it has dropped, its elements and the internal cooldowns each attacker and tag keeps
// On it, and the seconds since it was last hit
export interface Enemy {
  attackCooldownSeconds: number;
  campId: string;
  droppedThresholdCount: number;
  elementalState: ElementalState;
  enemyKindId: EnemyKindId;
  heading: number;
  health: number;
  hitSeconds: number;
  home: GroundPoint;
  id: string;
  internalCooldownMap: Map<string, InternalCooldown>;
  level: number;
  maxHealth: number;
  patrol: GroundPoint[];
  patrolIndex: number;
  poise: number;
  poiseBrokenSeconds: number;
  position: GroundPoint;
  state: EnemyState;
  stateSeconds: number;
  statuses: EnemyStatus[];
}
