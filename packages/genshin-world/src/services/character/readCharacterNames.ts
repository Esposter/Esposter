import { readCharacterIdNamesMap } from "#src/services/character/readCharacterIdNamesMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The names a character goes by in the languages the official packs name their models in, read from the hosted game data
export const readCharacterNames = async (gameDataBaseUrl: string, characterId: number): Promise<string[]> => {
  const characterIdNamesMap = await readCharacterIdNamesMap(gameDataBaseUrl);
  const characterNames = characterIdNamesMap.get(characterId);
  if (characterNames === undefined)
    throw new InvalidOperationError(Operation.Read, String(characterId), "is no character of the game's tables");
  return characterNames;
};
