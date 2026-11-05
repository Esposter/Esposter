import { SCRIPTED_FRAME_MS } from "#src/services/dev/constants";
import { createScriptedClock } from "#src/services/dev/createScriptedClock.fixture";
import { describe, expect, onTestFinished, test, vi } from "vitest";

describe(createScriptedClock, () => {
  test("A frame advances the clock by one fixed step", () => {
    expect.hasAssertions();

    const scriptedClock = createScriptedClock();
    onTestFinished(() => {
      scriptedClock.dispose();
    });
    const firedAfterTwoFrames = vi.fn<() => void>();
    setTimeout(firedAfterTwoFrames, 2 * SCRIPTED_FRAME_MS);
    const startMs = performance.now();
    scriptedClock.stepFrame();

    expect(performance.now() - startMs).toBeCloseTo(SCRIPTED_FRAME_MS, 3);
    expect(firedAfterTwoFrames).not.toHaveBeenCalled();
  });
});
