// What the repairer found and left: whether `main`'s head is red with repairs still to try — past them the lane
// Cuts as usual, since a person's own repair arrives as a claimed commit — and the head the session committed
// The repair at, absent when the session could not start or on a dry run
export interface RepairResult {
  isUnderRepair: boolean;
  targetSha?: string;
}
