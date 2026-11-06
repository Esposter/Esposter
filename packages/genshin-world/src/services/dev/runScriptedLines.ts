import type { DevResult } from "#src/models/dev/DevResult";
import type { ScriptedSessionDriver } from "#src/models/dev/ScriptedSessionDriver";

import { runDevScenario } from "#src/services/dev/runDevScenario";
import { settleScriptedSession } from "#src/services/dev/settleScriptedSession";

// Sends a run of registry lines through runDevScenario, which stops at the first refused one, then settles the terrain.
// A failure names the step it is on, counted from the script's first step, which the caller passes as `firstStep`: the
// Refused line's step, or the run's last line when the terrain does not settle
export const runScriptedLines = async (
  driver: ScriptedSessionDriver,
  lines: readonly string[],
  firstStep: number,
): Promise<DevResult> => {
  let stepNumber = firstStep - 1;
  const result = runDevScenario(
    (line) => {
      stepNumber += 1;
      return driver.run(line);
    },
    { lines, name: "the script" },
  );
  if (!result.ok) return { ...result, error: `step ${stepNumber}: ${result.error}` };

  const settled = await settleScriptedSession(driver);
  return settled.ok ? result : { error: `step ${stepNumber}: ${settled.error}`, ok: false, usage: "" };
};
