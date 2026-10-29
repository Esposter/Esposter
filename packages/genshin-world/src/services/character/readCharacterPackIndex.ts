import type { CharacterPackIndex } from "#src/models/character/CharacterPackIndex";

import { GameDataKeys } from "#src/generated/gameDataKeys";
import { characterPackIndexSchema } from "#src/models/character/CharacterPackIndex";
import { readGameData } from "#src/services/data/readGameData";

// The published index of the character packs, the one hosted game data record listing each avatar's name and files
export const readCharacterPackIndex = (gameDataBaseUrl: string): Promise<CharacterPackIndex> =>
  readGameData(gameDataBaseUrl, GameDataKeys.characterPackIndex.index, characterPackIndexSchema);
