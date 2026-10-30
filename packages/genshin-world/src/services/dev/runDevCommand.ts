import type { DevCommand } from "#src/models/dev/DevCommand";
import type { DevResult } from "#src/models/dev/DevResult";

import { formatDevUsage } from "#src/services/dev/formatDevUsage";

// Runs a command on the line's words, each read as the argument its command names in that place, and runs nothing when a
// Word is refused by its schema or there is a word past the last argument
export const runDevCommand = (command: DevCommand, words: readonly string[]): DevResult => {
  const usage = formatDevUsage(command);
  const { argumentNames } = command;
  if (words.length > argumentNames.length) return { error: "too many arguments", ok: false, usage };

  const parsedResult = command.args.safeParse(
    Object.fromEntries(argumentNames.map((argumentName, index) => [argumentName, words[index]])),
  );
  if (!parsedResult.success)
    return { error: parsedResult.error.issues.map((issue) => issue.message).join("; "), ok: false, usage };

  const outcome = command.run(parsedResult.data);
  return outcome.ok ? outcome : { ...outcome, usage };
};
