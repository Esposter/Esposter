import { TimeTrialChallengeState } from "#src/models/puzzle/TimeTrialChallengeState";
import { createTimeTrialChallenge } from "#src/services/puzzle/createTimeTrialChallenge";
import { startTimeTrialChallenge } from "#src/services/puzzle/startTimeTrialChallenge";
import { describe, expect, test } from "vitest";

describe(startTimeTrialChallenge, () => {
  test("starts its clock at its limit", () => {
    expect.hasAssertions();

    const challenge = createTimeTrialChallenge();
    startTimeTrialChallenge(challenge);

    expect({ remainingSeconds: challenge.remainingSeconds, state: challenge.state }).toStrictEqual({
      remainingSeconds: challenge.limitSeconds,
      state: TimeTrialChallengeState.Running,
    });
  });
});
