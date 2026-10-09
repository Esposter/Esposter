import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";

// Whether every half of the chamber has been defeated
export const checkIsAbyssChallengeCleared = (challenge: AbyssChallenge): boolean =>
  challenge.defeatedHalfCount >= challenge.halfCount;
