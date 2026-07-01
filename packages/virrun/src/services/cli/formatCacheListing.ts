// Pure string-building over already-resolved paths so the IO stays in the command and the formatting is testable.
export const formatCacheListing = ({
  isRepoStorePresent,
  repoStorePath,
  snapshotHashes,
  snapshotsPath,
  taskCount,
  tasksPath,
}: {
  isRepoStorePresent: boolean;
  repoStorePath: string;
  snapshotHashes: readonly string[];
  snapshotsPath: string;
  taskCount: number;
  tasksPath: string;
}): string => {
  const repoLine = `[virrun] repo store ${repoStorePath} (${isRepoStorePresent ? "present" : "absent"})`;
  const snapshotsLine =
    snapshotHashes.length === 0
      ? `[virrun] snapshots ${snapshotsPath} (none)`
      : `[virrun] snapshots ${snapshotsPath} (${snapshotHashes.length}): ${snapshotHashes.join(", ")}`;
  // Task entries are content-hash keyed and many, so report only the count, not every key.
  const tasksLine = `[virrun] tasks ${tasksPath} (${taskCount === 0 ? "none" : taskCount})`;
  return `${repoLine}\n${snapshotsLine}\n${tasksLine}`;
};
