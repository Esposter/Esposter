import type { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";

import { GAME_BLOCKS_DIRECTORY, SOURCE_EXPORT_SUFFIX } from "#src/services/genshinAssets/shared/constants";
import { runAnimeStudio } from "#src/services/genshinAssets/shared/runAnimeStudio";
import { existsSync } from "node:fs";
import { readdir, rename, rm } from "node:fs/promises";
import { basename, join } from "node:path";

// One block's objects of each type exported into `<directory>/<block>/<type>/<file>/`, a folder per file (its CAB,
// Lowercase as the CAB map keys it), so every object is held with the file its pointers resolve from: AnimeStudio
// Groups a source's export under a folder named after the block, whose files are moved up a level. A type is its own
// Run, since a file's objects are named by their own names and two types' objects share one
export const exportBlockBySource = async (
  block: string,
  types: readonly string[],
  exportType: AnimeStudioExportType,
  directory: string,
): Promise<void> => {
  const blockName = basename(block, ".blk");
  for (const type of types) {
    const typeDirectory = join(directory, blockName, type);
    runAnimeStudio([
      join(GAME_BLOCKS_DIRECTORY, block),
      typeDirectory,
      "--types",
      type,
      "--export_type",
      exportType,
      "--group_assets",
      "BySource",
    ]);
    const sourceDirectory = join(typeDirectory, `${blockName}${SOURCE_EXPORT_SUFFIX}`);
    if (!existsSync(sourceDirectory)) continue;
    // oxlint-disable-next-line no-await-in-loop -- a type's files are moved once AnimeStudio has written them
    const files = await readdir(sourceDirectory);
    // oxlint-disable-next-line no-await-in-loop -- as above
    await Promise.all(
      files.map((file) => rename(join(sourceDirectory, file), join(typeDirectory, file.toLowerCase()))),
    );
    // oxlint-disable-next-line no-await-in-loop -- as above
    await rm(sourceDirectory, { recursive: true });
  }
};
