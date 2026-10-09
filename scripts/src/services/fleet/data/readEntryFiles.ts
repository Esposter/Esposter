import type { FileEntry } from "#src/models/fleet/data/FileEntry";

import { checkIsFile } from "#src/services/fleet/data/checkIsFile";
import { readDirectory } from "#src/services/fleet/data/readDirectory";
import { toFileEntry } from "#src/services/fleet/data/toFileEntry";

// The files one entry lists: a directory's direct files, or a single-file entry as its one file, named empty, so joining
// The entry with that name gives the entry's own path. A missing entry lists as empty
export const readEntryFiles = async (absolutePath: string): Promise<FileEntry[]> => {
  if (!checkIsFile(absolutePath)) return (await readDirectory(absolutePath)).files;
  const file = await toFileEntry(absolutePath, "");
  return file === undefined ? [] : [file];
};
