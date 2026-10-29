import type { BlockFile } from "#src/models/genshinAssets/shared/BlockFile";

import { getShardDirectory } from "#src/services/genshinAssets/blocks/getShardDirectory";
import { getShardMapName } from "#src/services/genshinAssets/blocks/getShardMapName";
import { linkBlockFiles } from "#src/services/genshinAssets/blocks/linkBlockFiles";
import { GENSHIN_ANIMESTUDIO_OPTIONS, INSTALLED_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { runAnimeStudioAsync } from "#src/services/recreation/animeStudio/runAnimeStudioAsync";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { performance } from "node:perf_hooks";

// One shard's run of AnimeStudio over its own folder of symlinks, its map named for its index so no two shards' maps
// Meet. The run's output is judged as any run's is, so an exception in one fails the shard
export const mapShard = async (files: BlockFile[], index: number): Promise<void> => {
  const start = performance.now();
  const directory = getShardDirectory(index);
  const blocksDirectory = join(directory, "blocks");
  await rm(blocksDirectory, { force: true, recursive: true });
  await linkBlockFiles(files, INSTALLED_BLOCKS_DIRECTORY, blocksDirectory);
  await runAnimeStudioAsync(
    [blocksDirectory, directory, "--map_op", "Both", "--map_type", "JSON", "--map_name", getShardMapName(index)],
    GENSHIN_ANIMESTUDIO_OPTIONS,
    { belowNormal: false },
  );
  console.log(`shard ${index}: ${files.length} files, ${Math.round((performance.now() - start) / 1000)} s`);
};
