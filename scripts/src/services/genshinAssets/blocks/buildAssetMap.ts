import type { BlockFile } from "#src/models/genshinAssets/shared/BlockFile";

import { linkBlockFiles } from "#src/services/genshinAssets/blocks/linkBlockFiles";
import { linkInstalledBlocks } from "#src/services/genshinAssets/blocks/linkInstalledBlocks";
import { mergeCabMaps } from "#src/services/genshinAssets/blocks/mergeCabMaps";
import { partitionBlockFiles } from "#src/services/genshinAssets/blocks/partitionBlockFiles";
import { writeAssetIndex } from "#src/services/genshinAssets/blocks/writeAssetIndex";
import { writeMergedAssetMap } from "#src/services/genshinAssets/blocks/writeMergedAssetMap";
import {
  ASSET_MAP_NAME,
  ASSET_MAP_PATH,
  ASSET_MAP_SHARDS_DIRECTORY,
  CAB_MAP_PATH,
  GENSHIN_ANIMESTUDIO_OPTIONS,
  INSTALLED_BLOCKS_DIRECTORY,
} from "#src/services/genshinAssets/shared/constants";
import { getPerformanceCoreCount } from "#src/services/genshinAssets/shared/getPerformanceCoreCount";
import { runAnimeStudioAsync } from "#src/services/recreation/animeStudio/runAnimeStudioAsync";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { performance } from "node:perf_hooks";

const getShardDirectory = (index: number): string => join(ASSET_MAP_SHARDS_DIRECTORY, `${index}`);
const getShardMapName = (index: number): string => `${ASSET_MAP_NAME}_shard${index}`;

// One shard's run of AnimeStudio over its own folder of symlinks, its map named for its index so no two shards' maps
// Meet. The run's output is judged as any run's is, so an exception in one fails the shard
const mapShard = async (files: BlockFile[], index: number): Promise<void> => {
  const start = performance.now();
  const directory = getShardDirectory(index);
  const blocksDirectory = join(directory, "blocks");
  await rm(blocksDirectory, { force: true, recursive: true });
  await linkBlockFiles(files, INSTALLED_BLOCKS_DIRECTORY, blocksDirectory);
  await runAnimeStudioAsync(
    [blocksDirectory, directory, "--map_op", "Both", "--map_type", "JSON", "--map_name", getShardMapName(index)],
    GENSHIN_ANIMESTUDIO_OPTIONS,
  );
  console.log(`shard ${index}: ${files.length} files, ${Math.round((performance.now() - start) / 1000)} s`);
};

// Maps every asset in the blocks the game loads by name, type and block, which a patch or a hotfix changes and so is
// Rebuilt once each. The blocks are linked as the game loads them (`linkInstalledBlocks`), then cut into `shardCount`
// Shards of consecutive files of about equal bytes, each mapped by its own AnimeStudio run at once, then merged into the
// One CAB map and asset map a single run would have written, and the index is written from it
export const buildAssetMap = async (shardCount: number = getPerformanceCoreCount()): Promise<void> => {
  const shards = partitionBlockFiles(await linkInstalledBlocks(), shardCount);
  const indices = shards.map((_shard, index) => index);
  const settled = await Promise.allSettled(shards.map((files, index) => mapShard(files, index)));
  const failures = settled.flatMap((result) =>
    result.status === "rejected"
      ? [result.reason instanceof Error ? result.reason.message : String(result.reason)]
      : [],
  );
  if (failures.length > 0) throw new InvalidOperationError(Operation.Create, "AnimeStudio shards", failures.join("\n"));

  const mapsDirectory = dirname(CAB_MAP_PATH);
  const cabMaps = await Promise.all(
    indices.map((index) => readFile(join(mapsDirectory, `${getShardMapName(index)}.bin`))),
  );
  await writeFile(CAB_MAP_PATH, mergeCabMaps(cabMaps, INSTALLED_BLOCKS_DIRECTORY));
  await writeMergedAssetMap(
    indices.map((index) => ({
      path: join(getShardDirectory(index), `${getShardMapName(index)}.json`),
      root: join(getShardDirectory(index), "blocks"),
    })),
    INSTALLED_BLOCKS_DIRECTORY,
    ASSET_MAP_PATH,
  );
  await rm(ASSET_MAP_SHARDS_DIRECTORY, { force: true, recursive: true });
  await Promise.all(indices.map((index) => rm(join(mapsDirectory, `${getShardMapName(index)}.bin`), { force: true })));
  const count = await writeAssetIndex();
  console.log(`${count} assets indexed`);
};
