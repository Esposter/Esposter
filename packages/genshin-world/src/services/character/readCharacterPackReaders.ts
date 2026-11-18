import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

import { CHARACTER_PACK_CACHE_NAME } from "#src/services/character/constants";
import { createCharacterPackReader } from "#src/services/character/createCharacterPackReader";
import { readCharacterPackIndex } from "#src/services/character/readCharacterPackIndex";

// The readers of every published pack, each read from the cache the opening downloaded the packs into.
// Each is identified by the id of the character it is of. A pack's model is chosen by its first read, so making the
// Readers reads no name; a model that cannot be chosen fails its read, and its character draws the Traveler's model
// (`getCharacterPackReader`).
export const readCharacterPackReaders = async (gameDataBaseUrl: string): Promise<Map<number, CharacterPackReader>> => {
  const { avatars } = await readCharacterPackIndex(gameDataBaseUrl);
  const cache = await caches.open(CHARACTER_PACK_CACHE_NAME);
  return new Map(
    avatars.map((avatar) => {
      const characterPackReader = createCharacterPackReader(cache, gameDataBaseUrl, avatar);
      return [characterPackReader.characterId, characterPackReader] as const;
    }),
  );
};
