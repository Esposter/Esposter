import { getShardDirectory } from "#src/services/genshinAssets/blocks/getShardDirectory";
import { getShardMapName } from "#src/services/genshinAssets/blocks/getShardMapName";
import { linkInstalledBlocks } from "#src/services/genshinAssets/blocks/linkInstalledBlocks";
import { mapShard } from "#src/services/genshinAssets/blocks/mapShard";
import { mergeCabMaps } from "#src/services/genshinAssets/blocks/mergeCabMaps";
import { partitionBlockFiles } from "#src/services/genshinAssets/blocks/partitionBlockFiles";
import { writeAssetIndex } from "#src/services/genshinAssets/blocks/writeAssetIndex";
import { placeCabMap } from "#src/services/genshinAssets/blocks/placeCabMap";
import { writeMergedAssetMap } from "#src/services/genshinAssets/blocks/writeMergedAssetMap";
import {
  ANIMESTUDIO_MAPS_DIRECTORY,
  ASSET_MAP_PATH,
  ASSET_MAP_SHARDS_DIRECTORY,
  CAB_MAP_PATH,
  INSTALLED_BLOCKS_DIRECTORY,
} from "#src/services/genshinAssets/shared/constants";
import { getPerformanceCoreCount } from "#src/services/genshinAssets/shared/getPerformanceCoreCount";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Maps every asset in the blocks the game loads by name, type and block, which a patch or a hotfix changes and so is
// Rebuilt once each. The blocks are linked as the game loads them (`linkInstalledBlocks`), then cut into `shardCount`
// Shards of consecutive files of about equal bytes, each mapped by its own AnimeStudio run at once, then merged into
// The one CAB map and asset map a single run would have written, and the index is written from it
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

  // The CLI writes each shard's CAB map into its Maps folder, so that is where they are read and cleared from
  const cabMaps = await Promise.all(
    indices.map((index) => readFile(join(ANIMESTUDIO_MAPS_DIRECTORY, `${getShardMapName(index)}.bin`))),
  );
  await writeFile(CAB_MAP_PATH, mergeCabMaps(cabMaps, INSTALLED_BLOCKS_DIRECTORY));
  placeCabMap();
  await writeMergedAssetMap(
    indices.map((index) => ({
      path: join(getShardDirectory(index), `${getShardMapName(index)}.json`),
      root: join(getShardDirectory(index), "blocks"),
    })),
    INSTALLED_BLOCKS_DIRECTORY,
    ASSET_MAP_PATH,
  );
  await rm(ASSET_MAP_SHARDS_DIRECTORY, { force: true, recursive: true });
  await Promise.all(
    indices.map((index) => rm(join(ANIMESTUDIO_MAPS_DIRECTORY, `${getShardMapName(index)}.bin`), { force: true })),
  );
  const count = await writeAssetIndex();
  console.log(`${count} assets indexed`);
};
