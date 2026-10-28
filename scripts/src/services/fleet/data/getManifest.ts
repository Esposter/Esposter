import type { Manifest } from "#src/models/fleet/data/Manifest";

import { checkIsDirectory } from "#src/services/fleet/data/checkIsDirectory";
import { digestDirectory } from "#src/services/fleet/data/digestDirectory";
import { join } from "node:path";

// The digest of every directory under the folders that exist, so two machines compare their roots and list only the
// Directories whose digests differ
export const getManifest = async (parityDirectory: string, folders: string[]): Promise<Manifest> => {
  const manifest: Manifest = {};
  for (const folder of folders)
    if (checkIsDirectory(join(parityDirectory, folder))) await digestDirectory(parityDirectory, folder, manifest);

  return manifest;
};
