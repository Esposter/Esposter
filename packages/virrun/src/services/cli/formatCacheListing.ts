// Pure string-building over already-resolved paths so the IO stays in the command and the formatting is testable.
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
