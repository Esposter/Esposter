import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";

// The delay a method's call gives when it is the function a task queues, as in `c.Core.Tasks.Add(c.burstTick(), 137)`
// Or `trg.QueueEnemyTask(c.explode(), 120)`: read from its receiver through the call to the delay after its comma, else
// Undefined
export const readTaskArgumentDelayStart = (tokens: readonly GoToken[], site: number): number | undefined => {
  const receiver = site - 2;
  const isTaskQueue =
    checkIsGoPunctuation(tokens[site - 1], ".") &&
    checkIsGoPunctuation(tokens[receiver - 1], "(") &&
    checkIsGoPunctuation(tokens[receiver - 3], ".") &&
    (tokens[receiver - 2]?.text === "QueueEnemyTask" ||
      (tokens[receiver - 2]?.text === "Add" && tokens[receiver - 4]?.text === "Tasks"));
  if (!isTaskQueue) return undefined;
  const callEnd = parseGoExpression(tokens, receiver).end;
  return checkIsGoPunctuation(tokens[callEnd], ",") ? callEnd + 1 : undefined;
};
