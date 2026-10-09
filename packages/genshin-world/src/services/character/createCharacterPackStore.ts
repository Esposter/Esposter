import type { CharacterPackStorage } from "#src/models/character/CharacterPackStorage";
import type { CharacterPackStore } from "#src/models/character/CharacterPackStore";
import type { StoredCharacterPack } from "#src/models/character/StoredCharacterPack";

import { storedCharacterPackSchema } from "#src/models/character/StoredCharacterPack";
import { CHARACTER_PACK_INDEX_PATH } from "#src/services/character/constants";
import { getCharacterPackFilePath } from "#src/services/character/getCharacterPackFilePath";
import { createUniqueArraySchema, getResult, InvalidOperationError, Operation } from "@esposter/shared";

// Where a kept pack's files lie: under its character's id, then its hash
const getPackPath = ({ characterId, packHash }: StoredCharacterPack): string[] => [String(characterId), packHash];

// The packs the browser keeps, over whichever storage it has: each pack's files under its character's id and its hash,
// And an index of which characters have one. A pack is written whole before the index names it, and the index forgets a
// Pack before its files go, so the index never names a pack with files missing. An index that no longer parses is read
// As empty, as the save's latest shape is
export const createCharacterPackStore = (storage: CharacterPackStorage): CharacterPackStore => {
  const storedCharacterPacksSchema = createUniqueArraySchema(storedCharacterPackSchema, "characterId");
  const readIndex = async (): Promise<StoredCharacterPack[]> => {
    const indexBlob = await storage.read([CHARACTER_PACK_INDEX_PATH]);
    if (indexBlob === undefined) return [];
    const indexText = await indexBlob.text();
    // oxlint-disable-next-line no-restricted-properties -- the index's schema parses what it holds
    return getResult(() => storedCharacterPacksSchema.parse(JSON.parse(indexText))).unwrapOr([]);
  };
  const writeIndex = async (storedCharacterPacks: StoredCharacterPack[]): Promise<StoredCharacterPack[]> => {
    await storage.write([CHARACTER_PACK_INDEX_PATH], new Blob([JSON.stringify(storedCharacterPacks)]));
    return storedCharacterPacks;
  };
  return {
    put: async ({ characterId, files, packHash }) => {
      const storedCharacterPack = { characterId, packHash };
      await Promise.all(
        Array.from(files, ([path, blob]) =>
          storage.write([...getPackPath(storedCharacterPack), ...path.split("/")], blob),
        ),
      );
      const storedCharacterPacks = await readIndex();
      const replacedCharacterPack = storedCharacterPacks.find(
        (indexedCharacterPack) => indexedCharacterPack.characterId === characterId,
      );
      const index = await writeIndex([
        ...storedCharacterPacks.filter((indexedCharacterPack) => indexedCharacterPack.characterId !== characterId),
        storedCharacterPack,
      ]);
      if (replacedCharacterPack && replacedCharacterPack.packHash !== packHash)
        await storage.remove(getPackPath(replacedCharacterPack));
      return index;
    },
    readFile: async (storedCharacterPack, path) => {
      const blob = await storage.read([
        ...getPackPath(storedCharacterPack),
        ...getCharacterPackFilePath(path).split("/"),
      ]);
      if (blob === undefined)
        throw new InvalidOperationError(
          Operation.Read,
          path,
          `is no file of character ${storedCharacterPack.characterId}'s kept pack`,
        );
      return blob;
    },
    readIndex,
    remove: async (characterId) => {
      const storedCharacterPacks = await readIndex();
      const index = await writeIndex(
        storedCharacterPacks.filter((indexedCharacterPack) => indexedCharacterPack.characterId !== characterId),
      );
      await Promise.all(
        storedCharacterPacks
          .filter((indexedCharacterPack) => indexedCharacterPack.characterId === characterId)
          .map((indexedCharacterPack) => storage.remove(getPackPath(indexedCharacterPack))),
      );
      return index;
    },
  };
};
