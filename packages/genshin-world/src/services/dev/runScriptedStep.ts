import type { ScriptedSessionDriver } from "#src/models/dev/ScriptedSessionDriver";
import type { ScriptedSessionOutcome } from "#src/models/dev/ScriptedSessionOutcome";
import type { ScriptedStep } from "#src/models/dev/ScriptedStep";

import { ScriptedStepKind } from "#src/models/dev/ScriptedStepKind";
import { SCRIPTED_FRAME_MS } from "#src/services/dev/constants";
import { runScriptedExpect } from "#src/services/dev/runScriptedExpect";
import { exhaustiveGuard, MILLISECONDS_PER_SECOND } from "@esposter/shared";

// Runs one of the harness's own steps: a wait steps the scripted clock a count of fixed frames, an expect compares what
// Its line answers, and a save or a load takes the world's save or restores one
export const runScriptedStep = async (
  driver: ScriptedSessionDriver,
  step: Exclude<ScriptedStep, string>,
): Promise<ScriptedSessionOutcome> => {
  switch (step.kind) {
    case ScriptedStepKind.Expect:
      return runScriptedExpect(driver, step);
    case ScriptedStepKind.Load:
      return driver.load();
    case ScriptedStepKind.Save:
      return driver.save();
    case ScriptedStepKind.Wait: {
      const frames = Math.round((step.seconds * MILLISECONDS_PER_SECOND) / SCRIPTED_FRAME_MS);
      for (let frame = 0; frame < frames; frame += 1)
        // oxlint-disable-next-line no-await-in-loop -- Order is the contract: the frames land one at a time on the fixed clock
        await driver.frame();

      return { ok: true };
    }
    default:
      return exhaustiveGuard(step.kind);
  }
};
