import type { CharacterConstellationKit } from "#src/models/character/CharacterConstellationKit";
import type { ConstellationDepot } from "#src/models/character/ConstellationDepot";

// The skill set of each character whose one set holds constellations, by its id. A character with several sets, as a
// Traveler's element forms are, has none until a statue picks its set, so it is left out
export const getCharacterIdDepotMap = (
  characterConstellationKits: readonly CharacterConstellationKit[],
): Map<number, ConstellationDepot> => {
  const map = new Map<number, ConstellationDepot>();
  for (const { characterId, depots } of characterConstellationKits) {
    const [depot] = depots;
    if (depots.length === 1 && depot) map.set(characterId, depot);
  }
  return map;
};
