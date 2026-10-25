import type { AssetMapShard } from "#src/models/genshinAssets/shared/AssetMapShard";

import { mergeAssetMapLines } from "#src/services/genshinAssets/blocks/mergeAssetMapLines";
import { readFileLines } from "#src/services/genshinAssets/blocks/readFileLines";
import { once } from "node:events";
import { createWriteStream } from "node:fs";

// Writes the asset maps of the shards as one, a line at a time: each shard's file read as lines, the merged lines written
// As they come, waiting on the output's drain so the map is never held whole
export const writeMergedAssetMap = async (
  shards: AssetMapShard[],
  blocksRoot: string,
  outputPath: string,
): Promise<void> => {
  const output = createWriteStream(outputPath, "utf8");
  const lines = mergeAssetMapLines(
    shards.map(({ path, root }) => ({ lines: readFileLines(path), root })),
    blocksRoot,
  );
  for await (const line of lines) if (!output.write(`${line}\n`)) await once(output, "drain");
  output.end();
  await once(output, "finish");
};
