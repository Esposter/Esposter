import type { DirectoryContents } from "#src/models/fleet/data/DirectoryContents";
import type { Dirent } from "node:fs";

import { checkIsDirectory } from "#src/services/fleet/data/checkIsDirectory";
import { checkIsNotFound } from "#src/services/fleet/data/checkIsNotFound";
import { STAT_CONCURRENCY } from "#src/services/fleet/data/constants";
import { toFileEntry } from "#src/services/fleet/data/toFileEntry";
import { getResultAsync } from "@esposter/shared";
import { opendir } from "node:fs/promises";
import { join } from "node:path";

// A directory's direct files with size and mtime, and its child directories' names. Entries stream in and their stats run
// In batches of STAT_CONCURRENCY, so a directory of any size never holds more than one batch of promises. A missing
// Directory, including one removed after the check, lists as empty
export const readDirectory = async (absoluteDirectory: string): Promise<DirectoryContents> => {
  const contents: DirectoryContents = { directories: [], files: [] };
  if (!checkIsDirectory(absoluteDirectory)) return contents;
  const opened = await getResultAsync(() => opendir(absoluteDirectory));
  const directory = opened.match(
    (handle) => handle,
    (error) => {
      if (!checkIsNotFound(error)) throw error;
      return undefined;
    },
  );
  if (directory === undefined) return contents;
  let batch: Dirent[] = [];
  const flush = async (): Promise<void> => {
    const entries = await Promise.all(
      batch.map((entry) => toFileEntry(join(absoluteDirectory, entry.name), entry.name)),
    );
    for (const entry of entries) if (entry !== undefined) contents.files.push(entry);
    batch = [];
  };
  for await (const entry of directory)
    if (entry.isDirectory()) contents.directories.push(entry.name);
    else if (entry.isFile()) {
      batch.push(entry);
      if (batch.length === STAT_CONCURRENCY)
        // oxlint-disable-next-line no-await-in-loop -- A batch is flushed before the next one fills, so the stats never stack
        await flush();
    }

  await flush();
  return contents;
};
