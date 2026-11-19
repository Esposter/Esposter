import { formatSeconds } from "#src/services/timing/formatSeconds";
import { withFinalizerAsync } from "@esposter/shared";
import { writeSync } from "node:fs";

// `timePhase` for a phase that awaits, timed from its call to its settling, so a wait for a lock is inside the phase
export const timePhaseAsync = <T>(name: string, run: () => PromiseLike<T>): Promise<T> => {
  const start = performance.now();
  return withFinalizerAsync(
    () => Promise.resolve(run()),
    () => {
      writeSync(2, `${name}: ${formatSeconds(performance.now() - start)}\n`);
    },
  );
};
