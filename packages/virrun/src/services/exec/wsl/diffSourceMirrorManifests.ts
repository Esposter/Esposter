import type { SourceMirrorDelta } from "@/models/exec/wsl/SourceMirrorDelta";
import type { SourceMirrorManifest } from "@/models/exec/wsl/SourceMirrorManifest";
// Diff the mirror's published manifest against a fresh host walk into the minimal sync (SourceMirrorDelta): a new or
// Changed entry (size/mtimeMs/target — rsync's classic quick-check signal) is copied; a removed entry is deleted; a
// Type flip (file → directory, …) is deleted first and then copied so the archive extract recreates it cleanly
// Instead of landing on a non-matching entry. A removed directory's children are also in the delete set — `rm -rf` on
// The parent makes the child deletes no-ops, which is fine. Pure; both lists are sorted so a staged sync script is
// Deterministic.
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
