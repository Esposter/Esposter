import type { ChildProcess } from "node:child_process";

import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { getResult, noop } from "@esposter/shared";

// Bridge the parent's termination signals to the spawned child so Ctrl+C actually stops the run. Killing the
// Child alone is not enough on every backend: the native and linux-bwrap children are the process tree's root
// (killing bwrap collapses its PID namespace), but the wsl backend's child is the Windows `wsl.exe` client —
// The real tree (bwrap + the sandboxed command, e.g. an in-flight `oxlint`) lives under WSL's init, so it must
// Be reaped Linux-side via `onTerminate`. A terminal delivers Ctrl+C to the whole foreground process group at
// Once; `onTerminate` reproduces that so a grandchild dies immediately instead of running to completion.
// Installing our own handler also stops Node's default "exit immediately on SIGINT", so the parent waits for the
// Child's `close` and reports the real 128+signal exit code instead of masking it. The listeners are torn down on
// Whichever of `close`/`error` fires first, so a long-lived CLI never leaks a handler.
export const forwardTerminationSignals = (child: ChildProcess, onTerminate?: () => void): void => {
  const onSignal = (signal: NodeJS.Signals): void => {
    // The reaper is best-effort cleanup (it spawns another process); never let it throw out of a signal handler.
    // It is also the only thing that stops a wsl grandchild, so a failure here is a run that appears to have been
    // Interrupted while its real work carries on Linux-side — invisible unless it is said
    if (onTerminate)
      getResult(onTerminate).match(noop, ({ message }) => {
        writeVirrunDebug(`terminate reaper failed, a sandboxed grandchild may survive — ${message}`);
      });
    child.kill(signal);
  };
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);
  const cleanup = (): void => {
    process.off("SIGINT", onSignal);
    process.off("SIGTERM", onSignal);
  };
  child.once("close", cleanup);
  child.once("error", cleanup);
};
