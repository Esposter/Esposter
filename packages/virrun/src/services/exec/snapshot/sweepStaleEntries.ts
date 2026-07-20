import { removeSnapshotDirectoryDetached } from "@/services/exec/snapshot/removeSnapshotDirectoryDetached";
import { getResult, noop } from "@esposter/shared";
import { readdirSync } from "node:fs";
import { join } from "node:path";
// The shared sweep behind pruneStaleSnapshots / pruneStalePrepareLayers / reapStaleTemps: list a cache dir's child
// Directories and detach-remove each one `isStale` selects, best-effort per entry (a failed removal is cache hygiene
// The current run never depends on, so it must never abort the run). The listing itself is guarded too: an absent or
// Concurrently-removed dir sweeps nothing instead of throwing. The callers differ only in what they select — a
// Superseded hash/key (`name !== current`) or a hard-killed run's mkdtemp corpse (a temp prefix) — so the readdir +
// Guarded detached teardown lives here once instead of in each.
export const sweepStaleEntries = (dir: string, isStale: (name: string) => boolean): void => {
  for (const entry of getResult(() => readdirSync(dir, { withFileTypes: true })).unwrapOr([]))
    if (entry.isDirectory() && isStale(entry.name))
      getResult(() => {
        removeSnapshotDirectoryDetached(join(dir, entry.name));
      }).match(noop, noop);
};
