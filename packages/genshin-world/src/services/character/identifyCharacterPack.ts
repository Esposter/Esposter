import { getCharacterNameKey } from "#src/services/character/getCharacterNameKey";
import { takeOne } from "@esposter/shared";

// The character a picked release is of, by its models' own names, then its folders' names, each matched as a model is to
// Its character among the game's characters' names: the first set of names to match the character the release was
// Picked for, or exactly one character, decides. A release no set decides, its names matching no one or several, as
// The Traveler's twins share a name, is the picked character's, since it is still the one the player chose for them
export const identifyCharacterPack = (
  modelNames: readonly string[],
  folderNames: readonly string[],
  characterIdNamesMap: ReadonlyMap<number, readonly string[]>,
  characterId: number,
): number => {
  for (const names of [modelNames, folderNames]) {
    const nameKeys = new Set(names.map((name) => getCharacterNameKey(name)).filter(Boolean));
    const characterIds = [...characterIdNamesMap]
      .filter(([, characterNames]) =>
        characterNames.some((characterName) => nameKeys.has(getCharacterNameKey(characterName))),
      )
      .map(([id]) => id);
    if (characterIds.includes(characterId)) return characterId;
    if (characterIds.length === 1) return takeOne(characterIds);
  }

  return characterId;
};
