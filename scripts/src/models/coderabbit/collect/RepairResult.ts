// What the repairer found and left: whether `main`'s head is red with repairs still to try — past them the lane
// Cuts as usual, since a person's own repair arrives as a claimed commit — and the head the repair was committed
// At, absent when the session could not start or on a dry run
export interface RepairResult {
  isUnderRepair: boolean;
  // Whether the checks already passed on `targetSha`'s tree. The regenerating repair proves itself green before
  // It commits (`repairMechanically`) — it has no other way to know it answered the red — so the lane running
  // The same suite again would be the repair's whole cost paid twice. A session's repair carries no such proof:
  // The lane is where that one is verified.
  isVerified?: boolean;
  targetSha?: string;
}
