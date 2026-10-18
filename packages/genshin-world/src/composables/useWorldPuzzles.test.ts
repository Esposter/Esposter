import type { Seelie } from "#src/models/puzzle/Seelie";

import { useWorldPuzzles } from "#src/composables/useWorldPuzzles";
import { SeelieState } from "#src/models/puzzle/SeelieState";
import { SEELIE_FOLLOW_DISTANCE } from "#src/services/puzzle/constants";
import { describe, expect, test } from "vitest";

describe(useWorldPuzzles, () => {
  const SETTLED_SEELIE_ID = "settled";
  const RESTING_SEELIE_ID = "resting";
  const createSeelie = (id: string): Seelie => ({
    court: { x: 10, z: 0 },
    id,
    progress: 0,
    start: { x: 0, z: 0 },
    state: SeelieState.Resting,
    unfollowedSeconds: 0,
  });

  test("a Seelie the save names as settled starts settled at its court", () => {
    expect.hasAssertions();

    const { settledSeelieIds } = useWorldPuzzles(
      [createSeelie(SETTLED_SEELIE_ID), createSeelie(RESTING_SEELIE_ID)],
      new Set([SETTLED_SEELIE_ID]),
    );

    expect([...settledSeelieIds.value]).toStrictEqual([SETTLED_SEELIE_ID]);
  });

  test("a resting Seelie the character stands by is led on the step", () => {
    expect.hasAssertions();

    const { puzzleSeelies, stepWorldPuzzles } = useWorldPuzzles([createSeelie(RESTING_SEELIE_ID)], new Set());
    stepWorldPuzzles(1, { x: SEELIE_FOLLOW_DISTANCE, z: 0 });

    expect(puzzleSeelies[0]?.state).toBe(SeelieState.Led);
  });
});
