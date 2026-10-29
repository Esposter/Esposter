import type { DevCommand } from "#src/models/dev/DevCommand";
import type { DevResult } from "#src/models/dev/DevResult";

import { formatDevUsage } from "#src/services/dev/formatDevUsage";

// Runs a command on the line's words, each read as the argument its schema lists in that place, and runs nothing when a
// Word is refused by its schema or there is a word past the last argument
export const runDevCommand = (command: DevCommand, words: readonly string[]): DevResult => {
  const usage = formatDevUsage(command);
  const keys = Object.keys(command.args.shape);
  if (words.length > keys.length) return { error: "too many arguments", ok: false, usage };

  const parsed = command.args.safeParse(Object.fromEntries(keys.map((key, index) => [key, words[index]])));
  if (!parsed.success) return { error: parsed.error.issues.map((issue) => issue.message).join("; "), ok: false, usage };

  const outcome = command.run(parsed.data);
  return outcome.ok ? outcome : { ...outcome, usage };
};
