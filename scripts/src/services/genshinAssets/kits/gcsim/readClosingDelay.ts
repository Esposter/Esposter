import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { countTabs } from "#src/services/genshinAssets/kits/gcsim/countTabs";
import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

const QUEUE_CLOSE_REGEX = /^\}\s*,\s*(?<delay>.+?)\s*\)\s*$/u;

// The delay a `Tasks.Add(func() {`, `QueueCharTask(func() {` or `QueueEnemyTask(func() {` block gives the lines inside
// It, from its closing `}, delay)` line at the block's own indent, the first such line below the cited one. Undefined
// Where that closing gives no number
export const readClosingDelay = (
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
