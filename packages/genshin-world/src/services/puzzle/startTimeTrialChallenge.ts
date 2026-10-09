import type { TimeTrialChallenge } from "#src/models/puzzle/TimeTrialChallenge";

import { TimeTrialChallengeState } from "#src/models/puzzle/TimeTrialChallengeState";

// A Time Trial Challenge started from its marker, its clock set to its limit. A challenge already started is left as it is
export const startTimeTrialChallenge = (challenge: TimeTrialChallenge): void => {
  if (challenge.state !== TimeTrialChallengeState.Idle) return;
  challenge.remainingSeconds = challenge.limitSeconds;
  challenge.state = TimeTrialChallengeState.Running;
};
