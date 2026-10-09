import type { TimeTrialChallenge } from "#src/models/puzzle/TimeTrialChallenge";

import { TimeTrialChallengeState } from "#src/models/puzzle/TimeTrialChallengeState";

// A running challenge's clock moved on the fixed step, failed once it runs out before every target is done
export const stepTimeTrialChallenge = (challenge: TimeTrialChallenge, deltaSeconds: number): void => {
  if (challenge.state !== TimeTrialChallengeState.Running) return;
  challenge.remainingSeconds = Math.max(0, challenge.remainingSeconds - deltaSeconds);
  if (challenge.remainingSeconds === 0) challenge.state = TimeTrialChallengeState.Failed;
};
