import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { countTabs } from "#src/services/genshinAssets/kits/gcsim/countTabs";
import { readClosingDelay } from "#src/services/genshinAssets/kits/gcsim/readClosingDelay";
import { readLessIndentedLines } from "#src/services/genshinAssets/kits/gcsim/readLessIndentedLines";

const QUEUE_OPEN_REGEX = /(?:Tasks\.Add|QueueCharTask|QueueEnemyTask)\(func\(\)\s*\{\s*$/u;

// The delay the `Tasks.Add(func() {`, `QueueCharTask(func() {` and `QueueEnemyTask(func() {` blocks around a line add
// To its value, nested blocks adding up from the inside out. Found by scanning up through each less-indented line to
// The block that opens it. Zero where no block queues the line, undefined where a queued block's delay is not a number,
// So the line's value is Unsourced
export const readGcsimQueueDelay = (
  lines: readonly string[],
  lineIndex: number,
  resolveName: (name: string) => GoValue | undefined,
): number | undefined => {
  let delay = 0;
  for (const line of readLessIndentedLines(lines, lineIndex)) {
    if (!QUEUE_OPEN_REGEX.test(line)) continue;
    const closingDelay = readClosingDelay(lines, lineIndex, countTabs(line), resolveName);
    if (closingDelay === undefined) return undefined;
    delay += closingDelay;
  }
  return delay;
};
