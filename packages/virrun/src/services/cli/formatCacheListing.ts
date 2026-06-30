// Renders the `virrun cache ls` report: the repo-local dep store (gitignored `<root>/.virrun`, repopulated on the
// Next routed run) and the host-global warm-snapshot dir (`~/.virrun/snapshots`, shared across repos and keyed by
// Lockfile hash). Pure string-building over already-resolved paths so the IO (existence checks, dir reads) stays in
// The command and the formatting is unit-testable. Stderr-only like the other `[virrun]` lines.
export const formatCacheListing = ({
  isRepoStorePresent,
  repoStorePath,
  snapshotHashes,
  snapshotsPath,
}: {
  isRepoStorePresent: boolean;
  repoStorePath: string;
  snapshotHashes: readonly string[];
  snapshotsPath: string;
}): string => {
  const repoLine = `[virrun] repo store ${repoStorePath} (${isRepoStorePresent ? "present" : "absent"})`;
  const snapshotsLine =
    snapshotHashes.length === 0
      ? `[virrun] snapshots ${snapshotsPath} (none)`
      : `[virrun] snapshots ${snapshotsPath} (${snapshotHashes.length}): ${snapshotHashes.join(", ")}`;
  return `${repoLine}\n${snapshotsLine}`;
};
