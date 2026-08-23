import { Color } from "#src/models/cli/Color";
import { formatByteSize } from "#src/services/cli/cache/formatByteSize";
import { colorize } from "#src/services/cli/color/colorize";
import { formatVirrunLine } from "#src/services/cli/format/formatVirrunLine";
// The two key-listing tiers — warm snapshots and source-keyed prepare layers — report identically: the tier's path,
// Then either a dimmed "none" or the entry count followed by the keys themselves. One builder so the two can never
// Drift into reading differently for the same state.
const formatKeyedTierLine = (label: string, path: string, keys: readonly string[]): string =>
  formatVirrunLine(
    keys.length === 0
      ? `${label} ${colorize(path, Color.Blue)} (${colorize("none", Color.Dim)})`
      : `${label} ${colorize(path, Color.Blue)} (${colorize(String(keys.length), Color.Blue)}): ${keys.join(", ")}`,
  );
// Pure string-building over already-resolved paths so the IO stays in the command and the formatting is testable.
// Paths and counts are blue (the nouns), presence is green / absence red, and an empty tier's "none" is dimmed so the
// Populated-vs-empty state of each cache tier reads at a glance.
export const formatCacheListing = ({
  isRepoStorePresent,
  prepareKeys,
  preparePath,
  repoStorePath,
  snapshotHashes,
  snapshotsPath,
  taskBytes,
  taskCount,
  tasksPath,
}: {
  isRepoStorePresent: boolean;
  prepareKeys: readonly string[];
  preparePath: string;
  repoStorePath: string;
  snapshotHashes: readonly string[];
  snapshotsPath: string;
  taskBytes: number;
  taskCount: number;
  tasksPath: string;
}): string => {
  const repoLine = formatVirrunLine(
    `repo store ${colorize(repoStorePath, Color.Blue)} (${isRepoStorePresent ? colorize("present", Color.Green) : colorize("absent", Color.Red)})`,
  );
  const snapshotsLine = formatKeyedTierLine("snapshots", snapshotsPath, snapshotHashes);
  // Source-keyed prepare layers (framework artifacts, e.g. .nuxt); one live entry per source state after pruning.
  const prepareLine = formatKeyedTierLine("prepare", preparePath, prepareKeys);
  // Task entries are content-hash keyed and many, so report count + total payload size, not every key — the size
  // Makes the age-eviction bound (TASK_CACHE_MAX_AGE_DAYS) observable at a glance.
  const tasksLine = formatVirrunLine(
    taskCount === 0
      ? `tasks ${colorize(tasksPath, Color.Blue)} (${colorize("none", Color.Dim)})`
      : `tasks ${colorize(tasksPath, Color.Blue)} (${colorize(String(taskCount), Color.Blue)}, ${colorize(formatByteSize(taskBytes), Color.Blue)})`,
  );
  return `${repoLine}\n${snapshotsLine}\n${prepareLine}\n${tasksLine}`;
};
