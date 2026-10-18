import type { Seelie } from "#src/models/puzzle/Seelie";

import { SeelieState } from "#src/models/puzzle/SeelieState";
import { checkIsSeelieFollowed } from "#src/services/puzzle/checkIsSeelieFollowed";
import { SEELIE_FOLLOW_DISTANCE } from "#src/services/puzzle/constants";
import { describe, expect, test } from "vitest";

describe(checkIsSeelieFollowed, () => {
  const START = { x: 0, z: 0 };
  const seelie: Seelie = {
    court: { x: 100, z: 0 },
    id: "seelie",
    progress: 0,
    start: START,
    state: SeelieState.Resting,
    unfollowedSeconds: 0,
  };

  test("a Seelie the character stands within the follow distance of is followed", () => {
    expect.hasAssertions();

    expect(checkIsSeelieFollowed(seelie, { x: SEELIE_FOLLOW_DISTANCE, z: 0 })).toBe(true);
  });

  test("a Seelie the character stands beyond the follow distance of is not followed", () => {
    expect.hasAssertions();

    expect(checkIsSeelieFollowed(seelie, { x: SEELIE_FOLLOW_DISTANCE + 1, z: 0 })).toBe(false);
  });
});
