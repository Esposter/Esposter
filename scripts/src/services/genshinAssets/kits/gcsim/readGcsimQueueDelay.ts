import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { countTabs } from "#src/services/genshinAssets/kits/gcsim/countTabs";
import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readLessIndentedLines } from "#src/services/genshinAssets/kits/gcsim/readLessIndentedLines";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

const QUEUE_OPEN_REGEX = /(?:Tasks\.Add|QueueCharTask|QueueEnemyTask)\(func\(\)\s*\{\s*$/u;
const QUEUE_CLOSE_REGEX = /^\}\s*,\s*(?<delay>.+?)\s*\)\s*$/u;

// The delay a `Tasks.Add(func() {`, `QueueCharTask(func() {` or `QueueEnemyTask(func() {` block gives the lines inside
// It, from its closing `}, delay)` line at the block's own indent, the first such line below the cited one. Undefined
// Where that closing gives no number
const readClosingDelay = (
  lines: readonly string[],
  fromIndex: number,
  indent: number,
  resolveName: (name: string) => GoValue | undefined,
): number | undefined => {
  for (let position = fromIndex + 1; position < lines.length; position++) {
    const line = lines[position] ?? "";
    if (countTabs(line) !== indent || !line.trimStart().startsWith("}")) continue;
    const delayText = QUEUE_CLOSE_REGEX.exec(line.trim())?.groups?.delay;
    if (delayText === undefined) return undefined;
    return evaluateGoNumber(parseGoExpression(tokenizeGo(delayText), 0).expression, resolveName);
  }
  return undefined;
};

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
