import type { AbyssArena } from "#src/models/spiralAbyss/AbyssArena";

import { FLOOR } from "#src/services/spiralAbyss/constants.test";
import { enterArenaChamber } from "#src/services/spiralAbyss/enterArenaChamber.test";
import { stepAbyssArena } from "#src/services/spiralAbyss/stepAbyssArena";
import { describe, expect, test } from "vitest";

describe(stepAbyssArena, () => {
  const STEP_SECONDS = 10;

  test("the clock runs down while the chamber is fought", () => {
    expect.hasAssertions();
    const arena = enterArenaChamber();

    expect(stepAbyssArena(arena, STEP_SECONDS).challenge.secondsLeft).toBe(arena.challenge.secondsLeft - STEP_SECONDS);
  });

  test("a chamber not cleared before its clock runs out fails and awards no stars", () => {
    expect.hasAssertions();
    const arena = enterArenaChamber();

    expect(stepAbyssArena(arena, arena.challenge.secondsLeft)).toStrictEqual({
      ...arena,
      camp: undefined,
      challenge: { ...arena.challenge, secondsLeft: 0 },
    });
  });

  test("clearing a chamber with time left earns its stars, and its clock stops at the clear", () => {
    expect.hasAssertions();
    const cleared: AbyssArena = {
      ...enterArenaChamber(),
      camp: undefined,
      challenge: { defeatedHalfCount: FLOOR.teamCount, halfCount: FLOOR.teamCount, secondsLeft: 90 },
    };

    expect(stepAbyssArena(cleared, STEP_SECONDS)).toStrictEqual(cleared);
  });
});
