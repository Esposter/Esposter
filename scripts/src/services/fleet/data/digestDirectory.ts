import type { ChildDigest } from "#src/models/fleet/data/ChildDigest";
import type { Manifest } from "#src/models/fleet/data/Manifest";

import { getDirectoryDigest } from "#src/services/fleet/data/getDirectoryDigest";
import { readDirectory } from "#src/services/fleet/data/readDirectory";
import { join, posix } from "node:path";

// Digests a directory and every directory under it, recording each in the manifest and returning its own digest
export const digestDirectory = async (
  parityDirectory: string,
  directory: string,
  manifest: Manifest,
): Promise<string> => {
  const { directories, files } = await readDirectory(join(parityDirectory, directory));
  const children: ChildDigest[] = [];
  for (const name of directories) {
    // oxlint-disable-next-line no-await-in-loop -- Each subtree is digested before its sibling, so the walk holds one path at a time
    const digest = await digestDirectory(parityDirectory, posix.join(directory, name), manifest);
    children.push({ digest, name });
  }
  const digest = getDirectoryDigest(files, children);
  manifest[directory] = digest;
  return digest;
};
