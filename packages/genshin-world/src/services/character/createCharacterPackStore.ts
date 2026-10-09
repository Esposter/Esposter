import type { CharacterPackStorage } from "#src/models/character/CharacterPackStorage";
import type { CharacterPackStore } from "#src/models/character/CharacterPackStore";
import type { StoredCharacterPack } from "#src/models/character/StoredCharacterPack";

import { storedCharacterPackSchema } from "#src/models/character/StoredCharacterPack";
import { CHARACTER_PACK_INDEX_PATH } from "#src/services/character/constants";
import { getCharacterPackFilePath } from "#src/services/character/getCharacterPackFilePath";
import { listStoredCharacterPacks } from "#src/services/character/listStoredCharacterPacks";
import { createUniqueArraySchema, getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

// Where a kept pack's files lie: under its character's id, then its hash
const getPackPath = ({ characterId, packHash }: StoredCharacterPack): string[] => [String(characterId), packHash];

// The packs the browser keeps, over whichever storage it has: each pack's files under its character's id and its hash,
// And an index of which characters have one. A pack is written whole before the index names it, a pack whose writing
// Fails is removed, and the index forgets a pack before its files go, so the index never names a pack with files
// Missing. An index that cannot be read or no longer parses is logged and rebuilt from the packs' folders
export const createCharacterPackStore = (storage: CharacterPackStorage): CharacterPackStore => {
  const storedCharacterPacksSchema = createUniqueArraySchema(storedCharacterPackSchema, "characterId");
  const writeIndex = async (storedCharacterPacks: StoredCharacterPack[]): Promise<StoredCharacterPack[]> => {
    await storage.write([CHARACTER_PACK_INDEX_PATH], new Blob([JSON.stringify(storedCharacterPacks)]));
    return storedCharacterPacks;
  };
  // A storage that cannot list its packs either is logged and keeps none
  const rebuildIndex = (): Promise<StoredCharacterPack[]> =>
    getResultAsync(async () => writeIndex(await listStoredCharacterPacks(storage)))
      .orTee(console.error)
      .unwrapOr([]);
  const readIndex = async (): Promise<StoredCharacterPack[]> => {
    const storedCharacterPacks = await getResultAsync(async () => {
      const indexBlob = await storage.read([CHARACTER_PACK_INDEX_PATH]);
      if (indexBlob === undefined) return [];
      const indexText = await indexBlob.text();
      // oxlint-disable-next-line no-restricted-properties -- the index's schema parses what it holds
      return storedCharacterPacksSchema.parse(JSON.parse(indexText));
    })
      .orTee(console.error)
      .unwrapOr(undefined);
    return storedCharacterPacks ?? rebuildIndex();
  };
  return {
    put: async ({ characterId, files, modelName, packHash }) => {
      const storedCharacterPack = { characterId, packHash };
      const packPath = getPackPath(storedCharacterPack);
      const keptCharacterPacks = await readIndex();
      // The pack the character keeps already lies whole under the same hash, so nothing is written over it that a
      // Failure would remove
      if (
        keptCharacterPacks.some(
          (keptCharacterPack) =>
            keptCharacterPack.characterId === characterId && keptCharacterPack.packHash === packHash,
        )
      )
        return keptCharacterPacks;
      const { index, replacedCharacterPack } = await getResultAsync(async () => {
        // Every write settles before a failure is answered, so nothing is still writing into the folder it removes
        const settledWrites = await Promise.allSettled(
          Array.from(files, ([path, blob]) => storage.write([...packPath, ...path.split("/")], blob)),
        );
        for (const settledWrite of settledWrites) if (settledWrite.status === "rejected") throw settledWrite.reason;
        // Read again once the files are written, so a pack kept while they were stays named
        const storedCharacterPacks = await readIndex();
        return {
          index: await writeIndex([
            ...storedCharacterPacks.filter((indexedCharacterPack) => indexedCharacterPack.characterId !== characterId),
            storedCharacterPack,
          ]),
          replacedCharacterPack: storedCharacterPacks.find(
            (indexedCharacterPack) => indexedCharacterPack.characterId === characterId,
          ),
        };
      }).match(
        (keptIndex) => keptIndex,
        async (error) => {
          console.error(error);
          await storage.remove(packPath);
          throw new InvalidOperationError(
            Operation.Create,
            modelName,
            "was not kept, as the browser's storage is full",
          );
        },
      );
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
