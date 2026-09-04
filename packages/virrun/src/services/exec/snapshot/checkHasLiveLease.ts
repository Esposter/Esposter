import { VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME } from "#src/services/exec/snapshot/constants";
import { reapDeadLeases } from "#src/services/exec/snapshot/reapDeadLeases";
import { join } from "node:path";
// True when a live run still holds a lease on this snapshot/prepare hash dir. Reaps dead-pid leases as a side effect
// (reapDeadLeases), so pruneStale* both spares a dir another run is reading and clears a hard-killed run's stale lease.
export const checkHasLiveLease = (hashDir: string): boolean =>
  reapDeadLeases(join(hashDir, VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME));
