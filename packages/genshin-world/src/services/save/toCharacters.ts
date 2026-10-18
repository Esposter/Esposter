import type { Character } from "#src/models/character/Character";
import type { CharacterSave } from "#src/models/character/CharacterSave";

// The characters a save holds as the world holds them, each with the Companionship EXP the save keeps under its id, zero
// When it keeps none. Its copies are read apart as the world's copy counts
export const toCharacters = (
  characterSaves: CharacterSave[],
  companionshipExpMap: ReadonlyMap<number, number>,
): Character[] =>
  characterSaves.map(
    ({ artifacts, ascension, constellationCount, id, level, stellaFortunaCount, talentLevels, weapon }) => ({
      artifacts,
      ascension,
      constellationCount,
      friendshipExp: companionshipExpMap.get(id) ?? 0,
      id,
      level,
      stellaFortunaCount,
      talentLevels,
      weapon,
    }),
  );
