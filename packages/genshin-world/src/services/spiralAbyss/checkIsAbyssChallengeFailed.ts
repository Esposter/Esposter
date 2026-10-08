import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";

import { checkIsAbyssChallengeCleared } from "#src/services/spiralAbyss/checkIsAbyssChallengeCleared";

// Whether the chamber is lost: a clear never fails, and otherwise the clock running out or the Ley Line Monolith falling
// To no health fails it
export const checkIsAbyssChallengeFailed = (challenge: AbyssChallenge): boolean =>
  !checkIsAbyssChallengeCleared(challenge) &&
  (challenge.secondsLeft <= 0 || (challenge.monolithPercent !== undefined && challenge.monolithPercent <= 0));
