import { Color } from "@/models/cli/Color";
import { colorize } from "@/services/cli/color/colorize";
import { formatVirrunLine } from "@/services/cli/format/formatVirrunLine";
// Pure string-building over already-resolved paths so the IO stays in the command and the formatting is testable.
// Paths and counts are blue (the nouns), presence is green / absence red, and an empty tier's "none" is dimmed so the
// Populated-vs-empty state of each cache tier reads at a glance.
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
  const repoLine = formatVirrunLine(
    `repo store ${colorize(repoStorePath, Color.Blue)} (${isRepoStorePresent ? colorize("present", Color.Green) : colorize("absent", Color.Red)})`,
  );
  const snapshotsLine =
    snapshotHashes.length === 0
      ? formatVirrunLine(`snapshots ${colorize(snapshotsPath, Color.Blue)} (${colorize("none", Color.Dim)})`)
      : formatVirrunLine(
          `snapshots ${colorize(snapshotsPath, Color.Blue)} (${colorize(String(snapshotHashes.length), Color.Blue)}): ${snapshotHashes.join(", ")}`,
        );
  // Task entries are content-hash keyed and many, so report only the count, not every key.
  const tasksLine = formatVirrunLine(
    `tasks ${colorize(tasksPath, Color.Blue)} (${taskCount === 0 ? colorize("none", Color.Dim) : colorize(String(taskCount), Color.Blue)})`,
  );
  return `${repoLine}\n${snapshotsLine}\n${tasksLine}`;
};
