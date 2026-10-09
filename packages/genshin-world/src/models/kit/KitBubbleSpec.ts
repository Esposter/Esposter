import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { KitHit } from "#src/models/kit/KitHit";

// The bubble a hit holds the enemy it strikes in: its seconds, the explosion it bursts into on that enemy alone, and the
// Omen the burst puts on the enemy, which runs from the burst and not from the hit
export interface KitBubbleSpec {
  explosion: KitHit;
  omen: EnemyStatus;
  secondsRemaining: number;
}
