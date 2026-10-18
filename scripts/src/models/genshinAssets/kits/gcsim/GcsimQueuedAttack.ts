import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";

// One call of gcsim's `QueueAttack` or `QueueAttackWithSnap`, its `AttackInfo` named as the call passes it or written
// Inline in the call, and its damage delay read where its argument evaluates to a number, with the delay of any
// `Tasks.Add` closure it is in added to it. A call whose delay is a method's result has none, and a call in a
// Constant-bounds loop has one delay per iteration, evaluated with the loop variable's value.
// The `hold` parameter's value a call is read with, where its delay reads one, is its `holdValue`
export interface GcsimQueuedAttack {
  attackLine?: number;
  attackName?: string;
  delay?: number;
  delayLine: number;
  file: string;
  holdValue?: number;
  hitbox?: GcsimHitbox;
  // The values of the constant loops' variables this call is in, one iteration's, where a call is in a loop
  iterations?: Record<string, number>;
  line: number;
}
