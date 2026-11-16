import type { ChildDigest } from "#src/models/fleet/data/ChildDigest";
import type { FileEntry } from "#src/models/fleet/data/FileEntry";
import type { Manifest } from "#src/models/fleet/data/Manifest";

import { getDirectoryDigest } from "#src/services/fleet/data/getDirectoryDigest";
import { readDirectory } from "#src/services/fleet/data/readDirectory";
import { join, posix } from "node:path";

// A directory the walk has read: its child digests gather as its subdirectories finish, and its unread ones wait by name
interface OpenDirectory {
  children: ChildDigest[];
  directory: string;
  files: FileEntry[];
  name: string;
  unread: string[];
}

// Digests a directory and every directory under it, recording each in the manifest and returning its own digest. The walk
// Holds one path of open directories at a time, so a directory is recorded once its subtree is, and before its sibling
export const digestDirectory = async (
  parityDirectory: string,
  directory: string,
  manifest: Manifest,
): Promise<string> => {
  const open = async (path: string, name: string): Promise<OpenDirectory> => {
    const { directories, files } = await readDirectory(join(parityDirectory, path));
    return { children: [], directory: path, files, name, unread: directories };
  };
  const ancestors: OpenDirectory[] = [];
  let current = await open(directory, "");
  for (;;) {
    const name = current.unread.shift();
    if (name !== undefined) {
      ancestors.push(current);
      // oxlint-disable-next-line no-await-in-loop -- Order is the contract: each directory is recorded in the manifest as its walk finishes, and the manifest command prints the keys in that order
      current = await open(posix.join(current.directory, name), name);
      continue;
    }

    const digest = getDirectoryDigest(current.files, current.children);
    manifest[current.directory] = digest;
    const parent = ancestors.pop();
    if (parent === undefined) return digest;
    parent.children.push({ digest, name: current.name });
    current = parent;
  }
};
