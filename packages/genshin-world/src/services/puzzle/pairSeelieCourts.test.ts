import { SeelieState } from "#src/models/puzzle/SeelieState";
import { pairSeelieCourts } from "#src/services/puzzle/pairSeelieCourts";
import { describe, expect, test } from "vitest";

describe(pairSeelieCourts, () => {
  const FIRST_COURT = { x: 0, z: 0 };
  const SECOND_COURT = { x: 10, z: 0 };
  const NEAR_FIRST_COURT = { x: 1, z: 0 };
  const NEAR_SECOND_COURT = { x: 8, z: 0 };
  const FAR_SEELIE = { x: 50, z: 0 };

  test("the closest court and Seelie pair first", () => {
    expect.hasAssertions();

    expect(
      pairSeelieCourts([NEAR_FIRST_COURT, NEAR_SECOND_COURT, FAR_SEELIE], [SECOND_COURT, FIRST_COURT]),
    ).toStrictEqual([
      { court: FIRST_COURT, progress: 0, start: NEAR_FIRST_COURT, state: SeelieState.Resting, unfollowedSeconds: 0 },
      { court: SECOND_COURT, progress: 0, start: NEAR_SECOND_COURT, state: SeelieState.Resting, unfollowedSeconds: 0 },
    ]);
  });
});
