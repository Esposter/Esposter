import type { FileEntry } from "#src/models/fleet/data/FileEntry";
import type { Dirent } from "node:fs";

import { checkIsNotFound } from "#src/services/shared/checkIsNotFound";
import { getResultAsync, MILLISECONDS_PER_SECOND } from "@esposter/shared";
import { stat } from "node:fs/promises";
import { join } from "node:path";

// A file another process removed between its listing and its stat is skipped, as the parity folder is written while
// It is read; any other failure still reaches the caller. Its mtime is truncated to the second, as tar writes it, so a
// File's copy reads the same mtime as its source
export const toFileEntry = async (absoluteDirectory: string, entry: Dirent): Promise<FileEntry | undefined> => {
  const absolutePath = join(absoluteDirectory, entry.name);
  return (await getResultAsync(() => stat(absolutePath))).match(
    ({ mtimeMs, size }) => ({ mtime: Math.floor(mtimeMs / MILLISECONDS_PER_SECOND), name: entry.name, size }),
    (error) => {
      if (!checkIsNotFound(error)) throw error;
      console.info(`skipped ${absolutePath}: it was removed while it was listed`);
      return undefined;
    },
  );
};
