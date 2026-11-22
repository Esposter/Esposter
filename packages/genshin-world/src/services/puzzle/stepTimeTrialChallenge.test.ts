import { TimeTrialChallengeState } from "#src/models/puzzle/TimeTrialChallengeState";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { computeTimeTrialChestPlaces } from "#src/services/puzzle/computeTimeTrialChestPlaces";
import { createTimeTrialChallenge } from "#src/services/puzzle/createTimeTrialChallenge";
import { startTimeTrialChallenge } from "#src/services/puzzle/startTimeTrialChallenge";
import { stepTimeTrialChallenge } from "#src/services/puzzle/stepTimeTrialChallenge";
import { strikeTimeTrialTarget } from "#src/services/puzzle/strikeTimeTrialTarget";
import { describe, expect, test } from "vitest";

describe(stepTimeTrialChallenge, () => {
  test("a missed target before the timer ends gives no chest", () => {
    expect.hasAssertions();

    const marker = {
      challenge: { ...createTimeTrialChallenge(), targetCount: 2 },
      id: "id",
      position: { x: 3, z: -4 },
    };
    startTimeTrialChallenge(marker.challenge);
    strikeTimeTrialTarget(marker.challenge);
    stepTimeTrialChallenge(marker.challenge, marker.challenge.limitSeconds);

    expect({
      chestPlaces: computeTimeTrialChestPlaces([marker]),
      remainingSeconds: marker.challenge.remainingSeconds,
      state: marker.challenge.state,
    }).toStrictEqual({ chestPlaces: [], remainingSeconds: 0, state: TimeTrialChallengeState.Failed });
  });

  test("the timer runs out on the step its seconds do, not one step late", () => {
    expect.hasAssertions();

    const challenge = { ...createTimeTrialChallenge(), limitSeconds: 5 };
    startTimeTrialChallenge(challenge);
    for (let step = 0; step < 299; step++) stepTimeTrialChallenge(challenge, FIXED_STEP_SECONDS);

    expect(challenge.state).toBe(TimeTrialChallengeState.Running);

    stepTimeTrialChallenge(challenge, FIXED_STEP_SECONDS);

    expect(challenge.state).toBe(TimeTrialChallengeState.Failed);
  });

  test("leaves an idle challenge's clock alone", () => {
    expect.hasAssertions();

    const challenge = createTimeTrialChallenge();
    stepTimeTrialChallenge(challenge, challenge.limitSeconds);

    expect(challenge.state).toBe(TimeTrialChallengeState.Idle);
  });
});
