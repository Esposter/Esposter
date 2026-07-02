import { Color } from "@/models/cli/Color";
import { colorize } from "@/services/cli/colorize";
// Pure string-building over already-resolved paths so the IO stays in the command and the formatting is testable.
// Paths are dimmed (context, not the point), presence is green/absence red, and counts are magenta so the populated-
// Vs-empty state of each cache tier reads at a glance.
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
  const tag = colorize(colorize("[virrun]", Color.Cyan), Color.Bold);
  const repoLine = `${tag} repo store ${colorize(repoStorePath, Color.Dim)} (${isRepoStorePresent ? colorize("present", Color.Green) : colorize("absent", Color.Red)})`;
  const snapshotsLine =
    snapshotHashes.length === 0
      ? `${tag} snapshots ${colorize(snapshotsPath, Color.Dim)} (${colorize("none", Color.Dim)})`
      : `${tag} snapshots ${colorize(snapshotsPath, Color.Dim)} (${colorize(String(snapshotHashes.length), Color.Blue)}): ${snapshotHashes.join(", ")}`;
  // Task entries are content-hash keyed and many, so report only the count, not every key.
  const tasksLine = `${tag} tasks ${colorize(tasksPath, Color.Dim)} (${taskCount === 0 ? colorize("none", Color.Dim) : colorize(String(taskCount), Color.Blue)})`;
  return `${repoLine}\n${snapshotsLine}\n${tasksLine}`;
};
