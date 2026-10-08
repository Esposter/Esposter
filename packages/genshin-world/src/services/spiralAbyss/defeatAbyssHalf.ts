import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";

// The challenge after one of its halves has every enemy of its wave defeated, the next half to be fought from here
export const defeatAbyssHalf = (challenge: AbyssChallenge): AbyssChallenge => ({
  ...challenge,
  defeatedHalfCount: challenge.defeatedHalfCount + 1,
});
