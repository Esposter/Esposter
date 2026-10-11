import type { CharacterPackStorage } from "#src/models/character/CharacterPackStorage";

import { CHARACTER_PACK_STORE_NAME } from "#src/services/character/constants";
import { getResultAsync, noop, takeOne } from "@esposter/shared";

// A path the private file system holds nothing at, which a listing, a read or a removal of it answers with nothing
const checkIsNotFound = (error: Error): boolean => error instanceof DOMException && error.name === "NotFoundError";

// The packs' files in the browser's private file system, under its folder: each path's parts as nested folders and its
// File, written whole
export const createOpfsCharacterPackStorage = async (): Promise<CharacterPackStorage> => {
  const rootDirectory = await window.navigator.storage.getDirectory();
  const storeDirectory = await rootDirectory.getDirectoryHandle(CHARACTER_PACK_STORE_NAME, { create: true });
  const getDirectory = (directoryPath: readonly string[], isCreated: boolean): Promise<FileSystemDirectoryHandle> =>
    directoryPath.reduce(
      async (directory, part) => (await directory).getDirectoryHandle(part, { create: isCreated }),
      Promise.resolve(storeDirectory),
    );
  return {
    list: (path) =>
      getResultAsync(async () => Array.fromAsync((await getDirectory(path, false)).keys())).match(
        (names) => names,
        (error) => {
          if (checkIsNotFound(error)) return [];
          throw error;
        },
      ),
    read: (path) =>
      getResultAsync(async () => {
        const directory = await getDirectory(path.slice(0, -1), false);
        const fileHandle = await directory.getFileHandle(takeOne(path, path.length - 1));
        return fileHandle.getFile();
      }).match(
        (file): Blob | undefined => file,
        (error) => {
          if (checkIsNotFound(error)) return undefined;
          throw error;
        },
      ),
    remove: (path) =>
      getResultAsync(async () => {
        const directory = await getDirectory(path.slice(0, -1), false);
        await directory.removeEntry(takeOne(path, path.length - 1), { recursive: true });
      }).match(noop, (error) => {
        if (!checkIsNotFound(error)) throw error;
      }),
    write: async (path, blob) => {
      const directory = await getDirectory(path.slice(0, -1), true);
      const fileHandle = await directory.getFileHandle(takeOne(path, path.length - 1), { create: true });
      const writable = await fileHandle.createWritable();
      // A write that fails, as one past the storage's quota does, aborts its stream, whose lock on the file would
      // Otherwise refuse the file's removal
      await getResultAsync(async () => {
        await writable.write(blob);
        await writable.close();
      }).match(noop, async (error) => {
        await writable.abort();
        throw error;
      });
    },
  };
};
