import type { CharacterPackStorage } from "#src/models/character/CharacterPackStorage";
import type { CharacterPackStore } from "#src/models/character/CharacterPackStore";

import { createCharacterPackStore } from "#src/services/character/createCharacterPackStore";
import { createIndexedDbCharacterPackStorage } from "#src/services/character/createIndexedDbCharacterPackStorage";
import { createMemoryCharacterPackStorage } from "#src/services/character/createMemoryCharacterPackStorage";
import { createOpfsCharacterPackStorage } from "#src/services/character/createOpfsCharacterPackStorage";
import { getResultAsync } from "@esposter/shared";

// A storage that failed to open, logged so the next is tried
const logOpenError = (error: Error): undefined => {
  console.error(error);
  return undefined;
};

// The store of the packs a player loads, over the storage the browser has: its private file system where a file there
// Can be written from the page, else IndexedDB, else the page's own memory. A storage the browser has but refuses, as a
// Private window may, is logged and the next tried, so the store always opens
export const openCharacterPackStore = async (): Promise<CharacterPackStore> => {
  if (globalThis.FileSystemFileHandle !== undefined && "createWritable" in FileSystemFileHandle.prototype) {
    const opfsStorage = await getResultAsync(() => createOpfsCharacterPackStorage()).match(
      (storage): CharacterPackStorage | undefined => storage,
      logOpenError,
    );
    if (opfsStorage) return createCharacterPackStore(opfsStorage);
  }

  if (globalThis.indexedDB !== undefined) {
    const indexedDbStorage = await getResultAsync(() => createIndexedDbCharacterPackStorage()).match(
      (storage): CharacterPackStorage | undefined => storage,
      logOpenError,
    );
    if (indexedDbStorage) return createCharacterPackStore(indexedDbStorage);
  }

  return createCharacterPackStore(createMemoryCharacterPackStorage());
};
