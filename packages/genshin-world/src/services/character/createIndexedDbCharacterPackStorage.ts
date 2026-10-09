import type { CharacterPackStorage } from "#src/models/character/CharacterPackStorage";

import {
  CHARACTER_PACK_STORE_FILES_NAME,
  CHARACTER_PACK_STORE_NAME,
  CHARACTER_PACK_STORE_VERSION,
} from "#src/services/character/constants";
import { openDB } from "idb";

// The packs' files in IndexedDB, for a browser whose private file system cannot be written: one store of blobs keyed by
// Their paths joined by slashes
export const createIndexedDbCharacterPackStorage = async (): Promise<CharacterPackStorage> => {
  const database = await openDB(CHARACTER_PACK_STORE_NAME, CHARACTER_PACK_STORE_VERSION, {
    upgrade: (upgradedDatabase) => {
      upgradedDatabase.createObjectStore(CHARACTER_PACK_STORE_FILES_NAME);
    },
  });
  return {
    read: async (path) => {
      const blob: unknown = await database.get(CHARACTER_PACK_STORE_FILES_NAME, path.join("/"));
      return blob instanceof Blob ? blob : undefined;
    },
    remove: async (path) => {
      const removedPath = path.join("/");
      const transaction = database.transaction(CHARACTER_PACK_STORE_FILES_NAME, "readwrite");
      // Every path below the removed one runs from its slash up to the letter after the slash, "0"
      await Promise.all([
        transaction.store.delete(removedPath),
        transaction.store.delete(IDBKeyRange.bound(`${removedPath}/`, `${removedPath}0`, false, true)),
        transaction.done,
      ]);
    },
    write: async (path, blob) => {
      await database.put(CHARACTER_PACK_STORE_FILES_NAME, blob, path.join("/"));
    },
  };
};
