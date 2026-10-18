import type { TimeTrialChallenge } from "#src/models/puzzle/TimeTrialChallenge";

import { TimeTrialChallengeState } from "#src/models/puzzle/TimeTrialChallengeState";
import { TIME_TRIAL_CHALLENGE_LIMIT_SECONDS, TIME_TRIAL_CHALLENGE_TARGET_COUNT } from "#src/services/puzzle/constants";

// A Time Trial Challenge waiting at its marker, its limit and targets as the constants give them until a recording measures each.
// Its clock does not run until the challenge is started
export const createTimeTrialChallenge = (): TimeTrialChallenge => ({
  limitSeconds: TIME_TRIAL_CHALLENGE_LIMIT_SECONDS,
  remainingSeconds: 0,
  state: TimeTrialChallengeState.Idle,
  struckCount: 0,
  targetCount: TIME_TRIAL_CHALLENGE_TARGET_COUNT,
});
