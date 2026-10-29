import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

import { CHARACTER_PACK_CACHE_NAME } from "#src/services/character/constants";
import { createCharacterPackReader } from "#src/services/character/createCharacterPackReader";
import { readCharacterPackIndex } from "#src/services/character/readCharacterPackIndex";
import { getResultAsync } from "@esposter/shared";

// The readers of every published pack, each read from the cache the opening downloaded the packs into, by the id of the
// character it is of. A pack whose reader cannot be made is logged and left out, so its character is drawn by no model
// rather than the world waiting on it
export const readCharacterPackReaders = async (gameDataBaseUrl: string): Promise<Map<number, CharacterPackReader>> => {
  const { avatars } = await readCharacterPackIndex(gameDataBaseUrl);
  const cache = await caches.open(CHARACTER_PACK_CACHE_NAME);
  const characterPackReaders = await Promise.all(
    avatars.map((avatar) =>
      getResultAsync(() => createCharacterPackReader(cache, gameDataBaseUrl, avatar)).match(
        (characterPackReader) => characterPackReader,
        (error) => {
          console.error(error);
          return undefined;
        },
      ),
    ),
  );
  return new Map(
    characterPackReaders
      .filter((characterPackReader) => characterPackReader !== undefined)
      .map((characterPackReader) => [characterPackReader.characterId, characterPackReader] as const),
  );
};
