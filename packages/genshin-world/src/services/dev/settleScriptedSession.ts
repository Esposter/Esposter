import type { ScriptedSessionDriver } from "#src/models/dev/ScriptedSessionDriver";
import type { ScriptedSessionOutcome } from "#src/models/dev/ScriptedSessionOutcome";

import { SCRIPTED_FRAME_LIMIT, SCRIPTED_SETTLE_MIN_FRAMES } from "#src/services/dev/constants";
import { stepFramesUntil } from "#src/services/dev/stepFramesUntil";

// Steps frames until `settled` reads yes, one fixed step and one real frame at a time, and fails once
// SCRIPTED_FRAME_LIMIT frames have passed without it. The first read comes after SCRIPTED_SETTLE_MIN_FRAMES, so a view
// Change has applied and the terrain has selected for it before anything is read. A refused read fails at once, since no
// Number of frames would change a refusal
export const settleScriptedSession = async (driver: ScriptedSessionDriver): Promise<ScriptedSessionOutcome> => {
  const outcome = await stepFramesUntil<ScriptedSessionOutcome>(
    driver.frame,
    () => {
      const read = driver.run("settled");
      if (!read.ok) return { error: read.error, ok: false };

      return read.value === true ? { ok: true } : undefined;
    },
    SCRIPTED_SETTLE_MIN_FRAMES,
  );
  return outcome ?? { error: `not settled after ${SCRIPTED_FRAME_LIMIT} frames`, ok: false };
};
