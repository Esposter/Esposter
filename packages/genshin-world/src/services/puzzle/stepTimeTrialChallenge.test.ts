import type { TimeTrialChallenge } from "#src/models/puzzle/TimeTrialChallenge";

import { ChestKind } from "#src/models/chest/ChestKind";
import { TimeTrialChallengeState } from "#src/models/puzzle/TimeTrialChallengeState";
import { computeTimeTrialChestPlaces } from "#src/services/puzzle/computeTimeTrialChestPlaces";
import { startTimeTrialChallenge } from "#src/services/puzzle/startTimeTrialChallenge";
import { stepTimeTrialChallenge } from "#src/services/puzzle/stepTimeTrialChallenge";
import { strikeTimeTrialTarget } from "#src/services/puzzle/strikeTimeTrialTarget";
import { describe, expect, test } from "vitest";

const MARKER_ID = "marker";
const MARKER_POSITION = { x: 3, z: -4 };

describe(startTimeTrialChallenge, () => {
  const LIMIT_SECONDS = 10;
  const TARGET_COUNT = 2;

  const createChallenge = (): TimeTrialChallenge => ({
    limitSeconds: LIMIT_SECONDS,
    remainingSeconds: 0,
    state: TimeTrialChallengeState.Idle,
    struckCount: 0,
    targetCount: TARGET_COUNT,
  });

  test("starts its clock at its limit", () => {
    expect.hasAssertions();

    const challenge = createChallenge();
    startTimeTrialChallenge(challenge);

    expect({ remainingSeconds: challenge.remainingSeconds, state: challenge.state }).toStrictEqual({
      remainingSeconds: LIMIT_SECONDS,
      state: TimeTrialChallengeState.Running,
    });
  });
});

describe(strikeTimeTrialTarget, () => {
  const LIMIT_SECONDS = 10;
  const TARGET_COUNT = 2;

  const createChallenge = (): TimeTrialChallenge => ({
    limitSeconds: LIMIT_SECONDS,
    remainingSeconds: 0,
    state: TimeTrialChallengeState.Idle,
    struckCount: 0,
    targetCount: TARGET_COUNT,
  });

  test("finishing every target in time spawns the chest", () => {
    expect.hasAssertions();

    const marker = { challenge: createChallenge(), id: MARKER_ID, position: MARKER_POSITION };
    startTimeTrialChallenge(marker.challenge);
    stepTimeTrialChallenge(marker.challenge, LIMIT_SECONDS / 2);
    strikeTimeTrialTarget(marker.challenge);
    strikeTimeTrialTarget(marker.challenge);

    expect({ chestPlaces: computeTimeTrialChestPlaces([marker]), state: marker.challenge.state }).toStrictEqual({
      chestPlaces: [{ id: `time-trial-chest-${MARKER_ID}`, kind: ChestKind.Exquisite, position: MARKER_POSITION }],
      state: TimeTrialChallengeState.Solved,
    });
  });
});

describe(stepTimeTrialChallenge, () => {
  const LIMIT_SECONDS = 10;
  const TARGET_COUNT = 2;

  const createChallenge = (): TimeTrialChallenge => ({
    limitSeconds: LIMIT_SECONDS,
    remainingSeconds: 0,
    state: TimeTrialChallengeState.Idle,
    struckCount: 0,
    targetCount: TARGET_COUNT,
  });

  test("a missed target before the timer ends gives no chest", () => {
    expect.hasAssertions();

    const marker = { challenge: createChallenge(), id: MARKER_ID, position: MARKER_POSITION };
    startTimeTrialChallenge(marker.challenge);
    strikeTimeTrialTarget(marker.challenge);
    stepTimeTrialChallenge(marker.challenge, LIMIT_SECONDS);

    expect({
      chestPlaces: computeTimeTrialChestPlaces([marker]),
      remainingSeconds: marker.challenge.remainingSeconds,
      state: marker.challenge.state,
    }).toStrictEqual({ chestPlaces: [], remainingSeconds: 0, state: TimeTrialChallengeState.Failed });
  });

  test("leaves an idle challenge's clock alone", () => {
    expect.hasAssertions();

    const challenge = createChallenge();
    stepTimeTrialChallenge(challenge, LIMIT_SECONDS);

    expect(challenge.state).toBe(TimeTrialChallengeState.Idle);
  });
});
