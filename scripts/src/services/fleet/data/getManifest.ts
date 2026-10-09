import type { ChildDigest } from "#src/models/fleet/data/ChildDigest";
import type { Manifest } from "#src/models/fleet/data/Manifest";

import { checkIsDirectory } from "#src/services/fleet/data/checkIsDirectory";
import { getDirectoryDigest } from "#src/services/fleet/data/getDirectoryDigest";
import { readDirectory } from "#src/services/fleet/data/readDirectory";
import { join, posix } from "node:path";

// Digests a directory and every directory under it, recording each in the manifest and returning its own digest
const digestDirectory = async (parityDirectory: string, directory: string, manifest: Manifest): Promise<string> => {
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

// The digest of every directory under the folders that exist, so two machines compare their roots and list only the
// Directories whose digests differ
export const getManifest = async (parityDirectory: string, folders: string[]): Promise<Manifest> => {
  const manifest: Manifest = {};
  for (const folder of folders)
    if (checkIsDirectory(join(parityDirectory, folder)))
      // oxlint-disable-next-line no-await-in-loop -- Folders are digested one after another, as the walk is
      await digestDirectory(parityDirectory, folder, manifest);

  return manifest;
};
