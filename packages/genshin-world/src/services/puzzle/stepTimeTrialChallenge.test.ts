import type { TimeTrialChallenge } from "#src/models/puzzle/TimeTrialChallenge";

import { TimeTrialChallengeState } from "#src/models/puzzle/TimeTrialChallengeState";
import { startTimeTrialChallenge } from "#src/services/puzzle/startTimeTrialChallenge";
import { stepTimeTrialChallenge } from "#src/services/puzzle/stepTimeTrialChallenge";
import { strikeTimeTrialTarget } from "#src/services/puzzle/strikeTimeTrialTarget";
import { describe, expect, test } from "vitest";

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

  test("solves the challenge once every target is struck in time", () => {
    expect.hasAssertions();

    const challenge = createChallenge();
    startTimeTrialChallenge(challenge);
    strikeTimeTrialTarget(challenge);
    strikeTimeTrialTarget(challenge);

    expect(challenge.state).toBe(TimeTrialChallengeState.Solved);
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

  test("fails the challenge once its clock runs out before every target", () => {
    expect.hasAssertions();

    const challenge = createChallenge();
    startTimeTrialChallenge(challenge);
    strikeTimeTrialTarget(challenge);
    stepTimeTrialChallenge(challenge, LIMIT_SECONDS);

    expect({ remainingSeconds: challenge.remainingSeconds, state: challenge.state }).toStrictEqual({
      remainingSeconds: 0,
      state: TimeTrialChallengeState.Failed,
    });
  });

  test("leaves an idle challenge's clock alone", () => {
    expect.hasAssertions();

    const challenge = createChallenge();
    stepTimeTrialChallenge(challenge, LIMIT_SECONDS);

    expect(challenge.state).toBe(TimeTrialChallengeState.Idle);
  });
});
