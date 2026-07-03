import { removeSnapshotDirectoryDetached } from "@/services/exec/snapshot/removeSnapshotDirectoryDetached";
import { getResult, noop } from "@esposter/shared";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
// The shared sweep behind pruneStaleSnapshots / pruneStalePrepareLayers / reapStaleTemps: list a cache dir's child
// Directories and detach-remove each one `isStale` selects, best-effort per entry (a failed removal is cache hygiene
// The current run never depends on, so it must never abort the run). Absent dir = nothing to do. The callers differ
// Only in what they select — a superseded hash/key (`name !== current`) or a hard-killed run's mkdtemp corpse (a temp
// Prefix) — so the readdir + guarded detached teardown lives here once instead of in each.
export const sweepStaleEntries = (dir: string, isStale: (name: string) => boolean): void => {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true }))
    if (entry.isDirectory() && isStale(entry.name))
      getResult(() => {
        removeSnapshotDirectoryDetached(join(dir, entry.name));
      }).match(noop, noop);
};
