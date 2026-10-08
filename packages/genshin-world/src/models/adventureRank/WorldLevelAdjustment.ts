// Whether the player has lowered their World Level by one, and when that or its restoring last changed; a change is
// Allowed once its cooldown has run
export interface WorldLevelAdjustment {
  changedAt?: Temporal.Instant;
  isLowered: boolean;
}
