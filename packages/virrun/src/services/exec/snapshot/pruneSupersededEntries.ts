import { checkHasLiveLease } from "#src/services/exec/snapshot/checkHasLiveLease";
import { sweepStaleEntries } from "#src/services/exec/snapshot/sweepStaleEntries";
import { join } from "node:path";
// The shared eviction behind pruneStaleSnapshots / pruneStalePrepareLayers: only `dir/<currentName>` is reused by
// THIS run, so evict every superseded sibling to keep the host-global cache small — but that cache is shared across
// Repos/worktrees, so spare a superseded entry a concurrent run still leases (checkHasLiveLease, which also reaps that
// Entry's dead-pid leases in passing). The removals are pure cache hygiene the current run never depends on, so they
// Run detached (via sweepStaleEntries → removeSnapshotDirectoriesDetached) off the command's critical path,
// Best-effort per entry.
export const pruneSupersededEntries = (dir: string, currentName: string): void => {
  sweepStaleEntries(dir, (name) => name !== currentName && !checkHasLiveLease(join(dir, name)));
};
