import type { CommitAttempts } from "#src/models/coderabbit/collect/CommitAttempts";

// What the repairer left: the head the repair was committed at, with the recorder its attempt is counted through
// Should the cut then fail its checks — or nothing, when `main` is green, past its repairs, the session could not
// Start, or on a dry run
export type RepairResult =
  | {
      // Whether the checks already passed on `targetSha`'s tree. The regenerating repair proves itself green
      // Before it commits (`repairMechanically`) — it has no other way to know it answered the red — so the lane
      // Running the same suite again would be the repair's whole cost paid twice. A session's repair carries no
      // Such proof: the lane is where that one is verified.
      isVerified?: boolean;
      recordFailure: CommitAttempts["recordFailure"];
      targetSha: string;
    }
  | { targetSha?: undefined };
