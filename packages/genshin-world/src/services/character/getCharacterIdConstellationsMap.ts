import type { CharacterConstellationKit } from "#src/models/character/CharacterConstellationKit";
import type { Constellation } from "#src/models/character/Constellation";

// The constellations of each character whose one skill set holds any, by its id. A character with several sets, as a
// Traveler's element forms are, has none until a statue picks its set, so it is left out
export const getCharacterIdConstellationsMap = (
  characterConstellationKits: readonly CharacterConstellationKit[],
): Map<number, Constellation[]> => {
  const map = new Map<number, Constellation[]>();
  for (const { characterId, depots } of characterConstellationKits) {
    const [depot] = depots;
    if (depots.length === 1 && depot) map.set(characterId, depot.constellations);
  }
  return map;
};
