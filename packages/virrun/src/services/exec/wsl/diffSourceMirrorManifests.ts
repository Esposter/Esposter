import type { SourceMirrorDelta } from "@/models/exec/wsl/SourceMirrorDelta";
import type { SourceMirrorPublication } from "@/models/exec/wsl/SourceMirrorPublication";
// Diff what the mirror published after its last sync against a fresh host walk into the minimal sync
// (SourceMirrorDelta): a new or changed entry (size/mtimeMs/target — rsync's classic quick-check signal) is copied; a
// Removed entry is deleted; a type flip (file → directory, …) is deleted first and then copied so the archive extract
// Recreates it cleanly instead of landing on a non-matching entry. A removed directory's children are also in the
// Delete set — `rm -rf` on the parent makes the child deletes no-ops, which is fine.
//
// The exclude sets are diffed too, because they bound what the entry lists are able to say. A path excluded when the
// Mirror last synced appears in NEITHER manifest — not the old one (it was excluded then) and not the new walk (it
// Still is, or it is gone) — so an entries-only diff can never emit a delete for it, and whatever the mirror holds
// There outlives every later sync: read by the sandbox as if it were source, and copied up into the write-back's
// Upper by any tool that rewrites it. So every path the two sets disagree on is deleted outright:
//
// - newly excluded (a worktree added where plain mirrored directories used to be) — drop what was mirrored there
// - no longer excluded (a worktree removed) — drop the stale copy; if the path still exists on the host the walk
//   Lists it, and the delete-before-copy ordering rebuilds it from the archive
//
// Both are no-ops on a mirror that never held the path, which is the common case — an `rm -rf` of an absent path.
// Only a *slashed* pattern can be deleted this way, since a bare name matches at any depth and a path list cannot
// Express that; the planner routes a bare-name change to the clearing full materialize instead.
//
// Pure; both lists are sorted and deduplicated so a staged sync script is deterministic.
export const diffSourceMirrorManifests = (
  previous: SourceMirrorPublication,
  current: SourceMirrorPublication,
): SourceMirrorDelta => {
  const copyPaths: string[] = [];
  const deletePaths = new Set<string>();
  for (const [path, entry] of Object.entries(current.entries)) {
    const previousEntry = previous.entries[path];
    if (previousEntry === undefined) copyPaths.push(path);
    else if (previousEntry.type !== entry.type) {
      deletePaths.add(path);
      copyPaths.push(path);
    } else if (
      previousEntry.mtimeMs !== entry.mtimeMs ||
      previousEntry.size !== entry.size ||
      previousEntry.target !== entry.target
    )
      copyPaths.push(path);
  }
  for (const path of Object.keys(previous.entries)) if (current.entries[path] === undefined) deletePaths.add(path);
  const previousExcludes = new Set(previous.excludes);
  const currentExcludes = new Set(current.excludes);
  for (const exclude of [...previous.excludes, ...current.excludes])
    if (exclude.includes("/") && previousExcludes.has(exclude) !== currentExcludes.has(exclude))
      deletePaths.add(exclude);
  return { copyPaths: copyPaths.toSorted(), deletePaths: [...deletePaths].toSorted() };
};
