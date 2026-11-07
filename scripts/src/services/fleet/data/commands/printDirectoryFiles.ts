import { checkIsContainedPath } from "#src/services/fleet/data/checkIsContainedPath";
import { readDirectory } from "#src/services/fleet/data/readDirectory";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";

// Prints the direct files of each named directory under the parity directory, one JSON line each, in input order. Every
// Name is checked to stay inside the directory before any is read, so nothing outside it is ever listed
export const printDirectoryFiles = async (parityDirectory: string, directories: string[]): Promise<void> => {
  for (const directory of directories)
    if (!checkIsContainedPath(directory))
      throw new InvalidOperationError(Operation.Read, directory, "is not a directory inside the parity directory");
  // One directory is read at a time, its stats already batched within it, so a long list never holds every directory
  // Open at once, and each listing prints in input order as it is read
  for (const directory of directories) {
    // oxlint-disable-next-line no-await-in-loop -- A directory is read before the next opens, so the open handles never stack
    const { files } = await readDirectory(join(parityDirectory, directory));
    console.info(JSON.stringify({ directory, files }));
  }
};
