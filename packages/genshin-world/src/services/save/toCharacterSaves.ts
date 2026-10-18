import type { Character } from "#src/models/character/Character";
import type { CharacterSave } from "#src/models/character/CharacterSave";

// The characters the world holds as a save holds them, each with its copies from the world's copy counts. Its
// Companionship EXP is written by the save's companionshipExp, not here
export const toCharacterSaves = (
  characters: Character[],
  characterCopyCountMap: ReadonlyMap<number, number>,
): CharacterSave[] =>
  characters.map(
    ({ artifacts, ascension, constellationCount, id, level, stellaFortunaCount, talentLevels, weapon }) => ({
      artifacts,
      ascension,
      constellationCount,
      copyCount: characterCopyCountMap.get(id) ?? 0,
      id,
      level,
      stellaFortunaCount,
      talentLevels,
      weapon,
    }),
  );
