import type { ScriptedSessionDriver } from "#src/models/dev/ScriptedSessionDriver";
import type { ScriptedSessionOutcome } from "#src/models/dev/ScriptedSessionOutcome";

import { SCRIPTED_FRAME_LIMIT } from "#src/services/dev/constants";

// Steps frames until `settled` reads yes, one fixed step and one real frame at a time, and fails once
// SCRIPTED_FRAME_LIMIT frames have passed without it. A refused read fails at once, since no number of frames would
// Change a refusal
export const settleScriptedSession = async (driver: ScriptedSessionDriver): Promise<ScriptedSessionOutcome> => {
  let frames = 0;
  let read = driver.run("settled");
  while (read.ok && read.value !== true) {
    if (frames === SCRIPTED_FRAME_LIMIT)
      return { error: `not settled after ${SCRIPTED_FRAME_LIMIT} frames`, ok: false };

    await driver.frame();
    frames += 1;
    read = driver.run("settled");
  }

  return read.ok ? { ok: true } : { error: read.error, ok: false };
};
