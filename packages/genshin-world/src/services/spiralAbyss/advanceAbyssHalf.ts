import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";

import { defeatAbyssHalf } from "#src/services/spiralAbyss/defeatAbyssHalf";

// The challenge once the enemies of its current half are counted: a half that still has enemies is left as it is, and one
// Whose last enemy is defeated is advanced past, a chamber with no half left to fight being left as it is
export const advanceAbyssHalf = (challenge: AbyssChallenge, enemiesLeft: number): AbyssChallenge =>
  enemiesLeft > 0 || challenge.defeatedHalfCount >= challenge.halfCount ? challenge : defeatAbyssHalf(challenge);
