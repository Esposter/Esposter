import type { DevResult } from "#src/models/dev/DevResult";
import type { ScriptedSessionDriver } from "#src/models/dev/ScriptedSessionDriver";

import { runDevScenario } from "#src/services/dev/runDevScenario";

// Sends a run of registry lines through runDevScenario, which stops at the first refused one. The failure names that
// Line's step, counted from the script's first step, which the caller passes as `firstStep`
export const runScriptedLines = (
  driver: ScriptedSessionDriver,
  lines: readonly string[],
  firstStep: number,
): DevResult => {
  let stepNumber = firstStep - 1;
  const result = runDevScenario(
    (line) => {
      stepNumber += 1;
      return driver.run(line);
    },
    { lines, name: "the script" },
  );
  return result.ok ? result : { ...result, error: `step ${stepNumber}: ${result.error}` };
};
