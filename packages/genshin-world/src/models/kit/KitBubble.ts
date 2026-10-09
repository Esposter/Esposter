import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

// A bubble holding an enemy for the seconds left of it, which bursts once when the enemy takes a hit with poise damage or
// When its seconds run out. A burst puts the Omen on the enemy and its explosion, priced by the combatant that cast the
// Bubble as it stood then, lands on that enemy alone. A burst bubble stays until the step that explodes it
export interface KitBubble {
  combatant: Combatant;
  enemy: Enemy;
  explosion: KitHit;
  isBurst?: true;
  kind: "bubble";
  omen: EnemyStatus;
  secondsRemaining: number;
}
