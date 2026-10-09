import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";

// The challenge after `seconds` of its clock have run, its time left never below zero
export const stepAbyssChallenge = (challenge: AbyssChallenge, seconds: number): AbyssChallenge => ({
  ...challenge,
  secondsLeft: Math.max(0, challenge.secondsLeft - seconds),
});
