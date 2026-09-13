import type { CacheListing } from "#src/models/cli/CacheListing";

import { Color } from "#src/models/cli/Color";
import { formatByteSize } from "#src/services/cli/cache/formatByteSize";
import { formatKeyedTierLine } from "#src/services/cli/cache/formatKeyedTierLine";
import { colorize } from "#src/services/cli/color/colorize";
import { formatVirrunLine } from "#src/services/cli/format/formatVirrunLine";
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
}: CacheListing): string => {
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
