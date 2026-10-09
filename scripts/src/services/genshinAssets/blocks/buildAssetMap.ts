import type { BlockFile } from "#src/models/genshinAssets/shared/BlockFile";

import { linkBlockShard } from "#src/services/genshinAssets/blocks/linkBlockShard";
import { listBlockFiles } from "#src/services/genshinAssets/blocks/listBlockFiles";
import { mergeCabMaps } from "#src/services/genshinAssets/blocks/mergeCabMaps";
import { partitionBlockFiles } from "#src/services/genshinAssets/blocks/partitionBlockFiles";
import { writeAssetIndex } from "#src/services/genshinAssets/blocks/writeAssetIndex";
import { writeMergedAssetMap } from "#src/services/genshinAssets/blocks/writeMergedAssetMap";
import {
  ASSET_MAP_NAME,
  ASSET_MAP_PATH,
  ASSET_MAP_SHARDS_DIRECTORY,
  CAB_MAP_PATH,
  GAME_BLOCKS_DIRECTORY,
} from "#src/services/genshinAssets/shared/constants";
import { getPerformanceCoreCount } from "#src/services/genshinAssets/shared/getPerformanceCoreCount";
import { runAnimeStudioAsync } from "#src/services/genshinAssets/shared/runAnimeStudioAsync";
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
  await linkBlockShard(files, GAME_BLOCKS_DIRECTORY, blocksDirectory);
  await runAnimeStudioAsync([
    blocksDirectory,
    directory,
    "--map_op",
    "Both",
    "--map_type",
    "JSON",
    "--map_name",
    getShardMapName(index),
  ]);
  console.log(`shard ${index}: ${files.length} files, ${Math.round((performance.now() - start) / 1000)} s`);
};

// Maps every asset in the blocks by name, type and block, which a patch changes and so is rebuilt once each. The blocks
// Are cut into `shardCount` shards of consecutive files of about equal bytes, each mapped by its own AnimeStudio run at
// Once, then merged into the one CAB map and asset map a single run would have written, and the index is written from it
export const buildAssetMap = async (shardCount: number = getPerformanceCoreCount()): Promise<void> => {
  const shards = partitionBlockFiles(await listBlockFiles(GAME_BLOCKS_DIRECTORY), shardCount);
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
  await writeFile(CAB_MAP_PATH, mergeCabMaps(cabMaps, GAME_BLOCKS_DIRECTORY));
  await writeMergedAssetMap(
    indices.map((index) => ({
      path: join(getShardDirectory(index), `${getShardMapName(index)}.json`),
      root: join(getShardDirectory(index), "blocks"),
    })),
    GAME_BLOCKS_DIRECTORY,
    ASSET_MAP_PATH,
  );
  await rm(ASSET_MAP_SHARDS_DIRECTORY, { force: true, recursive: true });
  await Promise.all(indices.map((index) => rm(join(mapsDirectory, `${getShardMapName(index)}.bin`), { force: true })));
  const count = await writeAssetIndex();
  console.log(`${count} assets indexed`);
};
