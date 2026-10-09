import type { Attempts } from "#src/models/coderabbit/collect/Attempts";

// What the repairer left: the head the repair was committed at, with the recorders its attempt is counted through —
// As a failure should the cut then fail its checks, as an attempt once it is pushed — or nothing, when `main` is green,
// Past its repairs, or on a dry run
export type RepairResult =
  | {
      // When the attempt runs out (`REPAIR_ATTEMPT_TIMEOUT_MS`), which the repair step's verify of the repair runs inside too
      deadlineMs: number;
      // Whether the checks already passed on `targetSha`'s tree. The regenerating repair proves itself green
      // Before it commits (`repairMechanically`) — it has no other way to know it answered the red — so the repair
      // Step running the same suite again would be the repair's whole cost paid twice. A session's repair carries no
      // Such proof: the repair step (`runRepairStep`) is where that one is verified.
      isVerified?: boolean;
      recordAttempt: Attempts["recordAttempt"];
      recordFailure: Attempts["recordFailure"];
      targetSha: string;
    }
  | { targetSha?: undefined };
