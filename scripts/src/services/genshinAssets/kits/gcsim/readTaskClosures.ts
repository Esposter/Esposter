import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { TaskClosure } from "#src/models/genshinAssets/kits/gcsim/TaskClosure";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { findClosing } from "#src/services/genshinAssets/kits/gcsim/findClosing";

// The calls that queue a function as a task on a character or on an enemy, `c.QueueCharTask(` and `trg.QueueEnemyTask(`
const TASK_QUEUE_CALLEES = new Set(["QueueCharTask", "QueueEnemyTask"]);

// Each `Tasks.Add`, `QueueCharTask` or `QueueEnemyTask` closure of a file, read at its `Tasks` or queue call token
export const readTaskClosures = (tokens: readonly GoToken[]): TaskClosure[] => {
  const closures: TaskClosure[] = [];
  for (const [position, token] of tokens.entries()) {
    if (token.kind !== GoTokenKind.Identifier) continue;
    const funcStart =
      token.text === "Tasks" &&
      checkIsGoPunctuation(tokens[position + 1], ".") &&
      tokens[position + 2]?.text === "Add" &&
      checkIsGoPunctuation(tokens[position + 3], "(")
        ? position + 4
        : TASK_QUEUE_CALLEES.has(token.text) && checkIsGoPunctuation(tokens[position + 1], "(")
          ? position + 2
          : undefined;
    if (funcStart === undefined) continue;
    const bodyStart = funcStart + 3;
    const isClosure =
      tokens[funcStart]?.text === "func" &&
      checkIsGoPunctuation(tokens[funcStart + 1], "(") &&
      checkIsGoPunctuation(tokens[funcStart + 2], ")") &&
      checkIsGoPunctuation(tokens[bodyStart], "{");
    const bodyEnd = isClosure ? findClosing(tokens, bodyStart, "{", "}") : undefined;
    if (bodyEnd === undefined || !checkIsGoPunctuation(tokens[bodyEnd + 1], ",")) continue;
    closures.push({ bodyEnd, bodyStart, delayStart: bodyEnd + 2 });
  }
  return closures;
};
