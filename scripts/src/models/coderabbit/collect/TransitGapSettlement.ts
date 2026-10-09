// What a red workflow on `main` settles to against the queue: held — a transit gap, or a red the queue's run over the
// Head has yet to judge, with the wake owed once that run should have concluded — or not, which is the repairer's
export interface TransitGapSettlement {
  isHeld: boolean;
  retriggerDelaySeconds?: number;
}
