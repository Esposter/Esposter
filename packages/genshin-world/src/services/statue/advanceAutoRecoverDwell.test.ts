import type { AutoRecoverDwell } from "#src/models/statue/AutoRecoverDwell";

import { advanceAutoRecoverDwell } from "#src/services/statue/advanceAutoRecoverDwell";
import { AUTO_RECOVER_DWELL_SECONDS } from "#src/services/statue/constants";
import { describe, expect, test } from "vitest";

describe(advanceAutoRecoverDwell, () => {
  const FRAME_SECONDS = 1;
  const UNSTARTED: AutoRecoverDwell = { isRecovered: false, seconds: 0 };

  test("standing by a statue is due once, when it reaches the dwell", () => {
    expect.hasAssertions();

    const first = advanceAutoRecoverDwell(UNSTARTED, true, FRAME_SECONDS);
    expect(first.isDue).toBe(false);

    const second = advanceAutoRecoverDwell(first.dwell, true, AUTO_RECOVER_DWELL_SECONDS - FRAME_SECONDS);
    expect(second.isDue).toBe(true);
    expect(advanceAutoRecoverDwell(second.dwell, true, FRAME_SECONDS).isDue).toBe(false);
  });

  test("a step away from the statue ends the stand, so the next one runs its own", () => {
    expect.hasAssertions();

    const reached = advanceAutoRecoverDwell(
      { isRecovered: true, seconds: AUTO_RECOVER_DWELL_SECONDS },
      false,
      FRAME_SECONDS,
    );
    expect(reached.dwell).toStrictEqual(UNSTARTED);
    expect(advanceAutoRecoverDwell(reached.dwell, true, AUTO_RECOVER_DWELL_SECONDS).isDue).toBe(true);
  });
});
