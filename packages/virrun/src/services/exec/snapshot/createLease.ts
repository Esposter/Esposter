import type { Lease } from "@/models/exec/snapshot/Lease";

import { VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { reapDeadLeases } from "@/services/exec/snapshot/reapDeadLeases";
import { getResult, noop } from "@esposter/shared";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
// Take a live-user lease on a snapshot/prepare hash dir by writing `leases/<pid>`, so a concurrent run on a different
// Lockfile hash can't prune this layer while we read it (pruneStale* checks hasLiveLease). Reaps any dead-pid lease
// First — the live dir is never swept by the prune, so acquiring is where its hard-kill corpses die. The returned
// Handle's release() drops the lease on dispose (best-effort — a failed removal leaves a dead-pid corpse the next pass
// Reaps); a hard kill skips release entirely and the dead-pid reap reclaims it.
export const createLease = (hashDir: string): Lease => {
  const leasesDir = join(hashDir, VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME);
  mkdirSync(leasesDir, { recursive: true });
  reapDeadLeases(leasesDir);
  const leaseFile = join(leasesDir, String(process.pid));
  writeFileSync(leaseFile, "");
  return {
    release: () => {
      getResult(() => {
        rmSync(leaseFile, { force: true });
      }).match(noop, noop);
    },
  };
};
