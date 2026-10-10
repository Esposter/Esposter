import { characterDataSchema } from "#src/models/character/CharacterData";
import { CHARACTER_PACK_MODEL_NAME_LANGUAGES } from "#src/services/character/constants";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { readGameData } from "#src/services/data/readGameData";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

// The names a character goes by in the languages the official packs name their models in, read from the hosted game
// Data: its row of the characters' table names its text id, which each language's names give its name by
export const readCharacterNames = async (gameDataBaseUrl: string, characterId: number): Promise<string[]> => {
  const [characters, ...nameTexts] = await Promise.all([
    readGameData(gameDataBaseUrl, "stats/characters", z.array(characterDataSchema)),
    ...CHARACTER_PACK_MODEL_NAME_LANGUAGES.map((language) => NameTextLoaderMap[language](gameDataBaseUrl)),
  ]);
  const character = characters.find(({ id }) => id === characterId);
  if (character === undefined)
    throw new InvalidOperationError(Operation.Read, String(characterId), "is no character of the game's tables");
  return nameTexts.flatMap((nameText) => nameText[character.nameTextId] ?? []);
};
