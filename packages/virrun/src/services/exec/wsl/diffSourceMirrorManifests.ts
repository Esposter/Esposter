import type { SourceMirrorDelta } from "@/models/exec/wsl/SourceMirrorDelta";
import type { SourceMirrorManifest } from "@/models/exec/wsl/SourceMirrorManifest";
// Diff the mirror's published manifest against a fresh host walk into the minimal sync (SourceMirrorDelta): a new or
// Changed entry (size/mtimeMs/target quick-check, same signal rsync uses) is copied; a removed entry is deleted; a
// Type flip (file → directory, …) is deleted first and then copied so rsync recreates it cleanly instead of failing
// To replace a non-matching entry. A removed directory's children are also in the delete set — `rm -rf` on the parent
// Makes the child deletes no-ops, which is fine. Pure; both lists are sorted so a staged sync script is deterministic.
export const diffSourceMirrorManifests = (
  previous: SourceMirrorManifest,
  current: SourceMirrorManifest,
): SourceMirrorDelta => {
  const copyPaths: string[] = [];
  const deletePaths: string[] = [];
  for (const [path, entry] of Object.entries(current)) {
    const previousEntry = previous[path];
    if (previousEntry === undefined) copyPaths.push(path);
    else if (previousEntry.type !== entry.type) {
      deletePaths.push(path);
      copyPaths.push(path);
    } else if (
      previousEntry.mtimeMs !== entry.mtimeMs ||
      previousEntry.size !== entry.size ||
      previousEntry.target !== entry.target
    )
      copyPaths.push(path);
  }
  for (const path of Object.keys(previous)) if (current[path] === undefined) deletePaths.push(path);
  return { copyPaths: copyPaths.toSorted(), deletePaths: deletePaths.toSorted() };
};
