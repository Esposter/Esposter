import { ChestKind } from "#src/models/chest/ChestKind";
import { TimeTrialChallengeState } from "#src/models/puzzle/TimeTrialChallengeState";
import { computeTimeTrialChestPlaces } from "#src/services/puzzle/computeTimeTrialChestPlaces";
import { createTimeTrialChallenge } from "#src/services/puzzle/createTimeTrialChallenge";
import { startTimeTrialChallenge } from "#src/services/puzzle/startTimeTrialChallenge";
import { stepTimeTrialChallenge } from "#src/services/puzzle/stepTimeTrialChallenge";
import { strikeTimeTrialTarget } from "#src/services/puzzle/strikeTimeTrialTarget";
import { describe, expect, test } from "vitest";

describe(strikeTimeTrialTarget, () => {
  const MARKER_ID = "id";
  const MARKER_POSITION = { x: 3, z: -4 };

  test("finishing every target in time spawns the chest", () => {
    expect.hasAssertions();

    const marker = {
      challenge: { ...createTimeTrialChallenge(), targetCount: 2 },
      id: MARKER_ID,
      position: MARKER_POSITION,
    };
    startTimeTrialChallenge(marker.challenge);
    stepTimeTrialChallenge(marker.challenge, marker.challenge.limitSeconds / 2);
    strikeTimeTrialTarget(marker.challenge);
    strikeTimeTrialTarget(marker.challenge);

    expect({ chestPlaces: computeTimeTrialChestPlaces([marker]), state: marker.challenge.state }).toStrictEqual({
      chestPlaces: [{ id: `time-trial-chest-${MARKER_ID}`, kind: ChestKind.Exquisite, position: MARKER_POSITION }],
      state: TimeTrialChallengeState.Solved,
    });
  });
});
