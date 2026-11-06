import type { ScriptedSessionDriver } from "#src/models/dev/ScriptedSessionDriver";
import type { ScriptedSessionOutcome } from "#src/models/dev/ScriptedSessionOutcome";

import { SCRIPTED_FRAME_LIMIT, SCRIPTED_SETTLE_MIN_FRAMES } from "#src/services/dev/constants";

// Steps frames until `settled` reads yes, one fixed step and one real frame at a time, and fails once
// SCRIPTED_FRAME_LIMIT frames have passed without it. The first read comes after SCRIPTED_SETTLE_MIN_FRAMES, so a view
// Change has applied and the terrain has selected for it before anything is read. A refused read fails at once, since no
// Number of frames would change a refusal
export const settleScriptedSession = async (driver: ScriptedSessionDriver): Promise<ScriptedSessionOutcome> => {
  let frames = 0;
  while (frames < SCRIPTED_SETTLE_MIN_FRAMES) {
    await driver.frame();
    frames += 1;
  }

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
