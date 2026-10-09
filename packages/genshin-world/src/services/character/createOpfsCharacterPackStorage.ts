import type { CharacterPackStorage } from "#src/models/character/CharacterPackStorage";

import { CHARACTER_PACK_STORE_NAME } from "#src/services/character/constants";
import { getResultAsync, noop, takeOne } from "@esposter/shared";

// A path the private file system holds nothing at, which a read or a removal of it answers with nothing
const checkIsNotFound = (error: Error): boolean => error instanceof DOMException && error.name === "NotFoundError";

// The packs' files in the browser's private file system, under its folder: each path's parts as nested folders and its
// File, written whole
export const createOpfsCharacterPackStorage = async (): Promise<CharacterPackStorage> => {
  const rootDirectory = await window.navigator.storage.getDirectory();
  const storeDirectory = await rootDirectory.getDirectoryHandle(CHARACTER_PACK_STORE_NAME, { create: true });
  const getDirectory = (path: readonly string[], isCreated: boolean): Promise<FileSystemDirectoryHandle> =>
    path
      .slice(0, -1)
      .reduce(
        async (directory, part) => (await directory).getDirectoryHandle(part, { create: isCreated }),
        Promise.resolve(storeDirectory),
      );
  return {
    read: (path) =>
      getResultAsync(async () => {
        const directory = await getDirectory(path, false);
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
        const directory = await getDirectory(path, false);
        await directory.removeEntry(takeOne(path, path.length - 1), { recursive: true });
      }).match(noop, (error) => {
        if (!checkIsNotFound(error)) throw error;
      }),
    write: async (path, blob) => {
      const directory = await getDirectory(path, true);
      const fileHandle = await directory.getFileHandle(takeOne(path, path.length - 1), { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
    },
  };
};
