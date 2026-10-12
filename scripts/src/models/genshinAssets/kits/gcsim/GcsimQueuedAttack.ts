// One call of gcsim's `QueueAttack` or `QueueAttackWithSnap`, its `AttackInfo` named as the call passes it or written
// Inline in the call, and its damage delay read where its argument evaluates to a number. A call whose delay is a loop's
// Variable or a method's result has none
export interface GcsimQueuedAttack {
  attackLine?: number;
  attackName?: string;
  delay?: number;
  delayLine: number;
  file: string;
  line: number;
}
