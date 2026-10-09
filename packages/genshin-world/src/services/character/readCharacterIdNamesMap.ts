import { characterDataSchema } from "#src/models/character/CharacterData";
import { CHARACTER_PACK_MODEL_NAME_LANGUAGES } from "#src/services/character/constants";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The names every character goes by in the languages the official packs name their models in, by its id, read from the
// Hosted game data: its row of the characters' table names its text id, which each language's names give its name by
export const readCharacterIdNamesMap = async (gameDataBaseUrl: string): Promise<Map<number, string[]>> => {
  const [characters, ...nameTexts] = await Promise.all([
    readGameData(gameDataBaseUrl, "stats/characters", z.array(characterDataSchema)),
    ...CHARACTER_PACK_MODEL_NAME_LANGUAGES.map((language) => NameTextLoaderMap[language](gameDataBaseUrl)),
  ]);
  return new Map(
    characters.map(({ id, nameTextId }) => [id, nameTexts.flatMap((nameText) => nameText[nameTextId] ?? [])]),
  );
};
