import { formatSeconds } from "#src/services/timing/formatSeconds";
import { getLogPath } from "#src/services/timing/getLogPath";
import { getSlowRunWarning } from "#src/services/timing/getSlowRunWarning";
import { getTimingArgs } from "#src/services/timing/getTimingArgs";
import { recordTimingRun } from "#src/services/timing/recordTimingRun";
import { getResult } from "@esposter/shared";
import { writeSync } from "node:fs";

// Times this process as one run of `command`, from its start to its exit: every path out takes the `exit` event, the
// `process.exit` citty calls on a failure included. The run's time is one line on stderr, as a phase prints its own, so
// No command prints its own and stdout stays the command's; a slow run's line is the warning, and neither changes the
// Exit status.
export const timeCommand = (command: string): void => {
  // oxlint-disable-next-line no-restricted-properties -- the record keeps the shape of the argv citty parses, which only this run reads; citty reads the values
  const rawArgs = process.argv.slice(2);
  const date = Temporal.Now.instant().toString();
  process.once("exit", (exitCode) => {
    // `performance.now()` counts from the process's start, so a run includes loading its own modules, as its reader waits for it
    const milliseconds = performance.now();
    // The record is best effort: a log another run is replacing at that moment costs this run its line, never its exit
    getResult(() =>
      recordTimingRun(getLogPath(command), {
        args: getTimingArgs(rawArgs),
        command,
        date,
        exitCode,
        milliseconds: Math.round(milliseconds),
      }),
    ).match(
      (history) => {
        const warning = exitCode === 0 ? getSlowRunWarning(command, milliseconds, history) : undefined;
        writeSync(2, `${warning ?? `${command}: ${formatSeconds(milliseconds)}`}\n`);
      },
      (error) => {
        writeSync(2, `${command}: ${formatSeconds(milliseconds)}, not recorded: ${error.message}\n`);
      },
    );
  });
};
