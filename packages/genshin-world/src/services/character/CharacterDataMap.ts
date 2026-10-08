import type { CharacterData } from "#src/models/character/CharacterData";

import characters from "#src/generated/stats/characters.json";
import { characterDataSchema } from "#src/models/character/CharacterData";
import { z } from "zod";

// The roster by each character's id, as `pnpm -C scripts genshin:assets stats` writes it from the game's tables,
// Checked against its schema as the world's code loads
export const CharacterDataMap: ReadonlyMap<number, CharacterData> = new Map(
  z
    .array(characterDataSchema)
    .parse(characters)
    .map((characterData) => [characterData.id, characterData]),
);
