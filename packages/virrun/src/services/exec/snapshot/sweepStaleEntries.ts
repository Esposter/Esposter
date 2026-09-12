import { removeSnapshotDirectoriesDetached } from "#src/services/exec/snapshot/removeSnapshotDirectoriesDetached";
import { getResult } from "@esposter/shared";
import { readdirSync } from "node:fs";
import { join } from "node:path";
// The shared sweep behind pruneStaleSnapshots / pruneStalePrepareLayers / reapStaleTemps / reapAbandonedSourceMirrors:
// List a cache directory's child directories and detach-remove every one `isStale` selects, as ONE batched teardown
// (removeSnapshotDirectoriesDetached, which is also where per-entry best-effort lives — a failed removal is cache
// Hygiene the current run never depends on, so it must never abort the run). The listing itself is guarded too: an
// Absent or concurrently-removed directory sweeps nothing instead of throwing. The callers differ only in what they select —
// A superseded hash/key (`name !== current`), a hard-killed run's mkdtemp corpse (a temp prefix), a mirror whose repo
// Is gone — so the readdir + guarded teardown lives here once instead of in each.
export const sweepStaleEntries = (directory: string, isStale: (name: string, path: string) => boolean): void => {
  removeSnapshotDirectoriesDetached(
    getResult(() => readdirSync(directory, { withFileTypes: true }))
      .unwrapOr([])
      .filter((entry) => entry.isDirectory() && isStale(entry.name, join(directory, entry.name)))
      .map((entry) => join(directory, entry.name)),
  );
};
