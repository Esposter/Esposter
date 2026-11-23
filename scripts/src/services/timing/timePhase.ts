import { formatSeconds } from "#src/services/timing/formatSeconds";
import { withFinalizer } from "@esposter/shared";
import { writeSync } from "node:fs";

// Times one synchronous phase of a command and writes its seconds to stderr in the finalizer.
// So a phase that throws still reports how long it ran.
// A command with phases writes one line each, so a slow run names the phase that is slow.
export const timePhase = <T>(name: string, run: () => T): T => {
  const start = performance.now();
  return withFinalizer(run, () => {
    writeSync(2, `${name}: ${formatSeconds(performance.now() - start)}\n`);
  });
};
