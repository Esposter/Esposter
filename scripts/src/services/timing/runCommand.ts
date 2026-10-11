import type { ArgsDef, CommandDef } from "citty";

import { TIMINGS_DIRECTORY } from "#src/services/timing/constants";
import { getSlowRunWarning } from "#src/services/timing/getSlowRunWarning";
import { getTimingArgs } from "#src/services/timing/getTimingArgs";
import { recordTimingRun } from "#src/services/timing/recordTimingRun";
import { runMain } from "citty";
import { writeSync } from "node:fs";
import { join } from "node:path";

// The log's file name: a `:` is not allowed in a Windows file name, so the `ai:` names are written with `-`
const getLogPath = (command: string): string => join(TIMINGS_DIRECTORY, `${command.replaceAll(":", "-")}.jsonl`);

// Times this process as one run of `command`, from its start to its exit: every path out takes the `exit` event, the
// `process.exit` citty calls on a failure included. A slow run is a warning on stderr and never changes the exit status.
export const timeCommand = (command: string): void => {
  // oxlint-disable-next-line no-restricted-properties -- the record keeps the shape of the argv citty parses, which only this run reads; citty reads the values
  const rawArgs = process.argv.slice(2);
  const date = Temporal.Now.instant().toString();
  process.once("exit", (exitCode) => {
    // `performance.now()` counts from the process's start, so a run includes loading its own modules, as its reader waits for it
    const milliseconds = performance.now();
    const history = recordTimingRun(getLogPath(command), {
      args: getTimingArgs(rawArgs),
      command,
      date,
      exitCode,
      milliseconds: Math.round(milliseconds),
    });
    const warning = exitCode === 0 ? getSlowRunWarning(command, milliseconds, history) : undefined;
    if (warning !== undefined) writeSync(2, `${warning}\n`);
  });
};

// Every citty command line goes through this rather than `runMain`, so its run is timed with no opt-in
export const runCommand = async <T extends ArgsDef>(command: CommandDef<T>): Promise<void> => {
  const meta = typeof command.meta === "function" ? await command.meta() : await command.meta;
  timeCommand(meta?.name ?? "command");
  await runMain(command);
};
