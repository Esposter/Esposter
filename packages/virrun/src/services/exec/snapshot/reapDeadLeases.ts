import { isProcessAlive } from "@/services/exec/util/isProcessAlive";
import { getResult } from "@esposter/shared";
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
// Walk a hash dir's `leases/`, dropping every lease whose owner pid has died (a hard-killed run never released its
// Own), and report whether any live lease remains — the signal pruneStale* uses to spare a superseded layer another
// Run is still reading, and acquireLease uses to self-heal the live dir the prune never sweeps. Best-effort: an absent
// Dir (readdir errors) reads as "no live lease", and a failed file removal just leaves a corpse the next pass reaps.
export const reapDeadLeases = (leasesDir: string): boolean => {
  const entries = getResult(() => readdirSync(leasesDir));
  if (entries.isErr()) return false;
  let isLeaseLive = false;
  for (const entry of entries.value) {
    const pid = Number.parseInt(entry, 10);
    if (Number.isInteger(pid) && isProcessAlive(pid)) {
      isLeaseLive = true;
      continue;
    }
    getResult(() => {
      rmSync(join(leasesDir, entry), { force: true });
    }).match(
      () => undefined,
      () => undefined,
    );
  }
  return isLeaseLive;
};
