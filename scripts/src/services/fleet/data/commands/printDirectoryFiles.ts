import { readDirectory } from "#src/services/fleet/data/readDirectory";
import { join } from "node:path";

// Prints the direct files of each named directory under the parity directory, one JSON line each, in input order
export const printDirectoryFiles = async (parityDirectory: string, directories: string[]): Promise<void> => {
  // One directory is read at a time, its stats already batched within it, so a long list never holds every directory
  // Open at once, and each listing prints in input order as it is read
  for (const directory of directories) {
    // oxlint-disable-next-line no-await-in-loop -- A directory is read before the next opens, so the open handles never stack
    const { files } = await readDirectory(join(parityDirectory, directory));
    console.info(JSON.stringify({ directory, files }));
  }
};
