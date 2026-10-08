import type { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import type { EnemyState } from "#src/models/enemy/EnemyState";
import type { GroundPoint } from "genshin-engine";

// One enemy in the world as its AI moves it, written in place each step: its kind and level, its camp and spawn,
// Where it stands and faces, in radians about the vertical from south, its health and poise, its state and how long it
// Has held it, how long until it may attack again, how long its broken poise has left, which patrol point it walks to,
// And how many of its energy thresholds it has dropped
export interface Enemy {
  attackCooldownSeconds: number;
  campId: string;
  droppedThresholdCount: number;
  enemyKindId: EnemyKindId;
  heading: number;
  health: number;
  home: GroundPoint;
  id: string;
  level: number;
  maxHealth: number;
  patrol: GroundPoint[];
  patrolIndex: number;
  poise: number;
  poiseBrokenSeconds: number;
  position: GroundPoint;
  state: EnemyState;
  stateSeconds: number;
}
