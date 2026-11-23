import type { Character } from "#src/models/character/Character";

import { CONSTELLATION_COUNT } from "#src/services/wish/constants";

// Whether Paimon's Bargains sells a character to the player: one they do not hold, or hold below its full
// Constellations
export const checkIsPaimonsBargainsCharacterBuyable = (
  character: Pick<Character, "constellationCount"> | undefined,
): boolean => (character?.constellationCount ?? 0) < CONSTELLATION_COUNT;
