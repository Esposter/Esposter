import type { FileEntry } from "#src/models/fleet/data/FileEntry";

import { checkIsNotFound } from "#src/services/fleet/data/checkIsNotFound";
import { MILLISECONDS_PER_SECOND } from "#src/services/fleet/data/constants";
import { getResultAsync } from "@esposter/shared";
import { stat } from "node:fs/promises";

// A file another process removed between its listing and its stat is skipped, as the parity folder is written while
// It is read; any other failure still reaches the caller. Its mtime is truncated to the second, as tar writes it, so a
// File's copy reads the same mtime as its source
export const toFileEntry = async (absolutePath: string, name: string): Promise<FileEntry | undefined> =>
  (await getResultAsync(() => stat(absolutePath))).match(
    ({ mtimeMs, size }) => ({ mtime: Math.floor(mtimeMs / MILLISECONDS_PER_SECOND), name, size }),
    (error) => {
      if (!checkIsNotFound(error)) throw error;
      console.info(`skipped ${absolutePath}: it was removed while it was listed`);
      return undefined;
    },
  );
