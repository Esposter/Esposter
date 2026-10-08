import { MAX_STEPS_PER_FRAME } from "#src/simulation/constants";
import { createFixedStepLoop } from "#src/simulation/createFixedStepLoop";
import { describe, expect, test, vi } from "vitest";

describe(createFixedStepLoop, () => {
  const STEP_SECONDS = 0.5;

  test("runs whole steps from the time a frame adds, keeping the rest for the next", () => {
    expect.hasAssertions();

    const step = vi.fn<() => void>();
    const loop = createFixedStepLoop(STEP_SECONDS, step);
    loop.advance(0.25);
    loop.advance(0.75);

    expect(step).toHaveBeenCalledTimes(2);
  });

  test("gives how far the time left over has come into the next step", () => {
    expect.hasAssertions();

    const loop = createFixedStepLoop(STEP_SECONDS, vi.fn<() => void>());
    loop.advance(STEP_SECONDS * 1.5);

    expect(loop.getStepShare()).toBe(0.5);
  });

  test("runs at most the most steps a frame, and drops what it cannot run", () => {
    expect.hasAssertions();

    const step = vi.fn<() => void>();
    const loop = createFixedStepLoop(STEP_SECONDS, step);
    loop.advance(STEP_SECONDS * (MAX_STEPS_PER_FRAME + 2));
    loop.advance(0);

    expect(step).toHaveBeenCalledTimes(MAX_STEPS_PER_FRAME);
  });
});
