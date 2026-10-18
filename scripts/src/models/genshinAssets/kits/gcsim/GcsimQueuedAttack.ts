import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";

// One call of gcsim's `QueueAttack` or `QueueAttackWithSnap`, its `AttackInfo` named as the call passes it or written
// Inline in the call, and its damage delay read where its argument evaluates to a number, with the delay of any
// `Tasks.Add` closure it is in added to it. A call whose delay is a loop's variable or a method's result has none.
// The `hold` parameter's value a call is read with, where its delay reads one, is its `holdValue`
export interface GcsimQueuedAttack {
  attackLine?: number;
  attackName?: string;
  delay?: number;
  delayLine: number;
  file: string;
  holdValue?: number;
  hitbox?: GcsimHitbox;
  // A circle centred on the enemy a hit struck, `combat.NewCircleHitOnTarget(t, nil, radius)` with an identifier as its target,
  // Which gcsim passes from the hit's event. Kept apart from `hitbox`, so a call with it has no hitbox of its own
  struckEnemyHitbox?: GcsimHitbox;
  // The values of the constant loops' variables this call is in, one iteration's, where a call is in a loop
  iterations?: Record<string, number>;
  line: number;
}
