import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { GAME_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { runAnimeStudio } from "#src/services/genshinAssets/shared/runAnimeStudio";
import { mkdir } from "node:fs/promises";
import { basename, join } from "node:path";

// Exports the clips a name pattern matches from each block holding them as JSON, a folder per block under the directory
export const exportClipBlocks = async (
  clipPattern: string,
  blocks: readonly string[],
  directory: string,
): Promise<void> => {
  // Made here, since AnimeStudio makes it only for a block holding a clip it exports
  await mkdir(directory, { recursive: true });
  for (const block of blocks)
    runAnimeStudio([
      join(GAME_BLOCKS_DIRECTORY, block),
      join(directory, basename(block, ".blk")),
      "--types",
      AssetType.AnimationClip,
      "--names",
      clipPattern,
      "--export_type",
      AnimeStudioExportType.Json,
    ]);
};
