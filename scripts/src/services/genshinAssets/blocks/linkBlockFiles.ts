import type { BlockFile } from "#src/models/genshinAssets/shared/BlockFile";

import { mkdir, symlink } from "node:fs/promises";
import { dirname, join } from "node:path";

// Each file symlinked under the destination where it stands under the source, so AnimeStudio reads a folder of links as
// The blocks themselves, its CAB map's paths relative to that folder are the blocks' own, and no block is copied
export const linkBlockFiles = async (files: BlockFile[], source: string, destination: string): Promise<void> => {
  await Promise.all(
    files.map(async ({ path }) => {
      const link = join(destination, path);
      await mkdir(dirname(link), { recursive: true });
      await symlink(join(source, path), link);
    }),
  );
};
