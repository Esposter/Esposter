import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";

// One call of gcsim's `QueueAttack` or `QueueAttackWithSnap`, its `AttackInfo` named as the call passes it or written
// Inline in the call, and its damage delay read where its argument evaluates to a number, with the delay of any
// `Tasks.Add` closure it is in added to it. A call whose delay is a loop's variable or a method's result has none
export interface GcsimQueuedAttack {
  attackLine?: number;
  attackName?: string;
  delay?: number;
  delayLine: number;
  file: string;
  hitbox?: GcsimHitbox;
  line: number;
}
