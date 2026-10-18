import type { CharacterTalentKit } from "#src/models/character/CharacterTalentKit";

import { characterTalentKitSchema } from "#src/models/character/CharacterTalentKit";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The character talent kits `pnpm -C scripts genshin:assets stats` publishes, fetched by their key from the hosted game
// Data and checked against their shape as they arrive
export const readCharacterTalentKits = (gameDataBaseUrl: string): Promise<CharacterTalentKit[]> =>
  readGameData(gameDataBaseUrl, "stats/characterTalentKits", z.array(characterTalentKitSchema));
