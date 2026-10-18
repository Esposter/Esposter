import type { AscensionPhase } from "#src/models/character/AscensionPhase";

// The phase a character's table lists after the one at its ascension, whatever its level, or none at its last phase
export const getNextAscensionPhase = <TPhase extends AscensionPhase>(
  phases: TPhase[],
  ascension: number,
): TPhase | undefined => phases[ascension + 1];
