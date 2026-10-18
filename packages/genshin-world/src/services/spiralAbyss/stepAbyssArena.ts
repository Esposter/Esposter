import type { AbyssArena } from "#src/models/spiralAbyss/AbyssArena";

import { checkIsAbyssChallengeCleared } from "#src/services/spiralAbyss/checkIsAbyssChallengeCleared";
import { checkIsAbyssChallengeFailed } from "#src/services/spiralAbyss/checkIsAbyssChallengeFailed";
import { stepAbyssChallenge } from "#src/services/spiralAbyss/stepAbyssChallenge";

// The arena stepped by `seconds`: its clock runs while the chamber is fought, and a chamber whose clock runs out fails and drops
// Its camp. A cleared or failed chamber's clock has stopped, so its stars keep the seconds left at the clear
export const stepAbyssArena = (arena: AbyssArena, seconds: number): AbyssArena => {
  if (checkIsAbyssChallengeCleared(arena.challenge) || checkIsAbyssChallengeFailed(arena.challenge)) return arena;
  const challenge = stepAbyssChallenge(arena.challenge, seconds);
  return checkIsAbyssChallengeFailed(challenge) ? { ...arena, camp: undefined, challenge } : { ...arena, challenge };
};
