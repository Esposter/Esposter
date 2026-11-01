import type { CharacterConstellationKit } from "#src/models/character/CharacterConstellationKit";
import type { Constellation } from "#src/models/character/Constellation";

import { getCharacterIdDepotMap } from "#src/services/character/getCharacterIdDepotMap";

// The constellations of each character whose one skill set holds any, by its id
export const getCharacterIdConstellationsMap = (
  characterConstellationKits: readonly CharacterConstellationKit[],
): Map<number, Constellation[]> =>
  new Map(
    Array.from(
      getCharacterIdDepotMap(characterConstellationKits),
      ([characterId, { constellations }]) => [characterId, constellations] as const,
    ),
  );
