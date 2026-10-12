import type { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import type { AssetType } from "#src/models/genshinAssets/shared/AssetType";

import { AnimeStudioGroupType } from "#src/models/genshinAssets/shared/AnimeStudioGroupType";
import {
  ANIMESTUDIO_UNPARSED_SUFFIX,
  GENSHIN_ANIMESTUDIO_OPTIONS,
  INSTALLED_BLOCKS_DIRECTORY,
  SOURCE_EXPORT_SUFFIX,
} from "#src/services/genshinAssets/shared/constants";
import { runAnimeStudio } from "#src/services/recreation/animeStudio/runAnimeStudio";
import { existsSync } from "node:fs";
import { readdir, rename, rm } from "node:fs/promises";
import { basename, join } from "node:path";

// One block's objects of each type exported into `<directory>/<block>/<type>/<file>/`, a folder per file (its CAB,
// Lowercase as the CAB map keys it), so every object is held with the file its pointers resolve from: AnimeStudio
// Groups a source's export under a folder named after the block, whose files are moved up a level. A type is its own
// Run, since a file's objects are named by their own names and two types' objects share one. An unparsed export writes
// The objects' bytes without AnimeStudio's parser, which refuses some of the game's shaders, into the same type's folder
export const exportBlockBySource = async (
  block: string,
  types: readonly AssetType[],
  exportType: AnimeStudioExportType,
  directory: string,
  { isUnparsed = false }: { isUnparsed?: boolean } = {},
): Promise<void> => {
  const blockName = basename(block, ".blk");
  for (const type of types) {
    const typeDirectory = join(directory, blockName, type);
    runAnimeStudio(
      [
        join(INSTALLED_BLOCKS_DIRECTORY, block),
        typeDirectory,
        "--types",
        isUnparsed ? `${type}${ANIMESTUDIO_UNPARSED_SUFFIX}` : type,
        "--export_type",
        exportType,
        "--group_assets",
        AnimeStudioGroupType.BySource,
      ],
      GENSHIN_ANIMESTUDIO_OPTIONS,
    );
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
