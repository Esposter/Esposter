import { TimeTrialChallengeState } from "#src/models/puzzle/TimeTrialChallengeState";
import { TIME_TRIAL_CHALLENGE_LIMIT_SECONDS, TIME_TRIAL_CHALLENGE_TARGET_COUNT } from "#src/services/puzzle/constants";
import { createTimeTrialChallenge } from "#src/services/puzzle/createTimeTrialChallenge";
import { describe, expect, test } from "vitest";

describe(createTimeTrialChallenge, () => {
  test("a time trial challenge waits at its marker idle, with its limit and targets", () => {
    expect.hasAssertions();

    expect(createTimeTrialChallenge()).toStrictEqual({
      limitSeconds: TIME_TRIAL_CHALLENGE_LIMIT_SECONDS,
      remainingSeconds: 0,
      state: TimeTrialChallengeState.Idle,
      struckCount: 0,
      targetCount: TIME_TRIAL_CHALLENGE_TARGET_COUNT,
    });
  });
});
