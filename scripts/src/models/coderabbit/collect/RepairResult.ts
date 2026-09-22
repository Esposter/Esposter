// What the repairer left: the head the repair was committed at, absent when `main` is green, past its repairs,
// The session could not start, or on a dry run
export interface RepairResult {
  // Whether the checks already passed on `targetSha`'s tree. The regenerating repair proves itself green before
  // It commits (`repairMechanically`) — it has no other way to know it answered the red — so the lane running
  // The same suite again would be the repair's whole cost paid twice. A session's repair carries no such proof:
  // The lane is where that one is verified.
  isVerified?: boolean;
  targetSha?: string;
}
