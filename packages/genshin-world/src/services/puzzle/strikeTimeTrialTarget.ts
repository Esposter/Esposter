import type { TimeTrialChallenge } from "#src/models/puzzle/TimeTrialChallenge";

import { TimeTrialChallengeState } from "#src/models/puzzle/TimeTrialChallengeState";

// A target of a running challenge done, such as a ring passed or an enemy defeated. Solved once the last one is done
export const strikeTimeTrialTarget = (challenge: TimeTrialChallenge): void => {
  if (challenge.state !== TimeTrialChallengeState.Running) return;
  challenge.struckCount += 1;
  if (challenge.struckCount >= challenge.targetCount) challenge.state = TimeTrialChallengeState.Solved;
};
