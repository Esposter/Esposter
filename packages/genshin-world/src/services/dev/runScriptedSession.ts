import type { DevResult } from "#src/models/dev/DevResult";
import type { ScriptedSessionDriver } from "#src/models/dev/ScriptedSessionDriver";
import type { ScriptedStep } from "#src/models/dev/ScriptedStep";

import { runScriptedLines } from "#src/services/dev/runScriptedLines";
import { runScriptedStep } from "#src/services/dev/runScriptedStep";
import { takeScriptedLines } from "#src/services/dev/takeScriptedLines";
import { takeOne } from "@esposter/shared";

// Runs a script's steps in order. Each run of registry lines goes through runDevScenario and then settles the
// Terrain, and each harness step goes through its own runner. The script stops at the first step that fails, and the
// Failure names that step by its number
export const runScriptedSession = async (
  driver: ScriptedSessionDriver,
  steps: readonly ScriptedStep[],
): Promise<DevResult> => {
  let index = 0;
  while (index < steps.length) {
    const step = takeOne(steps, index);
    if (typeof step === "string") {
      const lines = takeScriptedLines(steps, index);
      const result = await runScriptedLines(driver, lines, index + 1);
      if (!result.ok) return result;

      index += lines.length;
    } else {
      const outcome = await runScriptedStep(driver, step);
      if (!outcome.ok) return { error: `step ${index + 1}: ${outcome.error}`, ok: false, usage: "" };

      index += 1;
    }
  }

  return { ok: true, value: steps.length };
};
