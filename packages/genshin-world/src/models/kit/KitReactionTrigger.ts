import type { Reaction } from "#src/models/combat/Reaction";
import type { Enemy } from "#src/models/enemy/Enemy";

// A reaction a hit or a tick triggered on an enemy, kept for the world to hear once the step's strikes have landed
export interface KitReactionTrigger {
  enemy: Enemy;
  reactions: Reaction[];
}
