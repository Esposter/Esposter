import type { Character } from "#src/models/character/Character";

// The characters with each Stella Fortuna a wish brought added to its own, by the count the wish's map gives its
// Character. A character the map does not name is kept as it was
export const addStellaFortuna = (
  characters: readonly Character[],
  stellaFortunaCountMap: ReadonlyMap<number, number>,
): Character[] =>
  characters.map((character) => {
    const stellaFortunaCount = stellaFortunaCountMap.get(character.id);
    return stellaFortunaCount === undefined
      ? character
      : { ...character, stellaFortunaCount: character.stellaFortunaCount + stellaFortunaCount };
  });
