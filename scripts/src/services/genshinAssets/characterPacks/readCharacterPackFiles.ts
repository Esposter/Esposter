import type { CharacterPackFile } from "#src/models/genshinAssets/characterPacks/CharacterPackFile";

import { listBlockFiles } from "#src/services/genshinAssets/blocks/listBlockFiles";
import { CHARACTER_PACKS_BLOB_PREFIX } from "#src/services/genshinAssets/characterPacks/constants";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// Every file of every avatar folder, each named by its avatar id and its path inside that folder, with forward slashes
// Whatever the platform, so a blob name reads the same on every machine
export const readCharacterPackFiles = async (directory: string): Promise<CharacterPackFile[]> => {
  const avatarEntries = await readdir(directory, { withFileTypes: true });
  const filesPerAvatar = await Promise.all(
    avatarEntries
      .filter((entry) => entry.isDirectory())
      .map(async ({ name: avatarId }) => {
        const avatarDirectory = join(directory, avatarId);
        const files = await listBlockFiles(avatarDirectory);
        return files.map(({ path, size }) => ({
          avatarId,
          blobName: `${CHARACTER_PACKS_BLOB_PREFIX}/${avatarId}/${path}`,
          localPath: join(avatarDirectory, path),
          path,
          size,
        }));
      }),
  );
  return filesPerAvatar.flat();
};
