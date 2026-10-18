import type { Seelie } from "#src/models/puzzle/Seelie";

import { SeelieState } from "#src/models/puzzle/SeelieState";
import { computeSeeliePosition } from "#src/services/puzzle/computeSeeliePosition";
import { describe, expect, test } from "vitest";

describe(computeSeeliePosition, () => {
  const START = { x: 0, z: 0 };
  const COURT = { x: 10, z: 4 };
  const createSeelie = (progress: number): Seelie => ({
    court: COURT,
    id: "seelie",
    progress,
    start: START,
    state: SeelieState.Led,
    unfollowedSeconds: 0,
  });

  test("a Seelie led halfway stands halfway along its route", () => {
    expect.hasAssertions();

    expect(computeSeeliePosition(createSeelie(0.5))).toStrictEqual({ x: 5, z: 2 });
  });
});
