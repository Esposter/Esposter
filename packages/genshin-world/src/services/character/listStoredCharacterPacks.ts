import type { CharacterPackStorage } from "#src/models/character/CharacterPackStorage";
import type { StoredCharacterPack } from "#src/models/character/StoredCharacterPack";

import { storedCharacterPackSchema } from "#src/models/character/StoredCharacterPack";

// The packs a storage holds by its folders alone, as an index lost to a read or a parse is rebuilt: each folder named by
// A character's id, and in it the first folder named by a pack's hash
export const listStoredCharacterPacks = async (storage: CharacterPackStorage): Promise<StoredCharacterPack[]> => {
  const characterIdNames = await storage.list([]);
  const storedCharacterPacks = await Promise.all(
    characterIdNames.map(async (characterIdName): Promise<StoredCharacterPack[]> => {
      const characterId = Number(characterIdName);
      if (!storedCharacterPackSchema.shape.characterId.safeParse(characterId).success) return [];
      const packHash = (await storage.list([characterIdName])).find(
        (packHashName) => storedCharacterPackSchema.shape.packHash.safeParse(packHashName).success,
      );
      return packHash === undefined ? [] : [{ characterId, packHash }];
    }),
  );
  return storedCharacterPacks.flat();
};
