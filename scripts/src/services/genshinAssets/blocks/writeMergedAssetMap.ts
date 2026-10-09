import type { AssetMapShard } from "#src/models/genshinAssets/shared/AssetMapShard";

import { mergeAssetMapLines } from "#src/services/genshinAssets/blocks/mergeAssetMapLines";
import { once } from "node:events";
import { createReadStream, createWriteStream } from "node:fs";
import { createInterface } from "node:readline";

// A file's lines, its stream opened only when the merge reaches the file: a line interface opened earlier reads its
// File in the background and loses the lines it reads before anything listens, then never ends
const readFileLines = async function* (path: string): AsyncGenerator<string> {
  for await (const line of createInterface({ crlfDelay: Infinity, input: createReadStream(path, "utf8") })) yield line;
};

// Writes the asset maps of the shards as one, a line at a time: each shard's file read as lines, the merged lines written
// As they come, waiting on the output's drain so the map is never held whole
export const writeMergedAssetMap = async (
  shards: AssetMapShard[],
  gameRoot: string,
  outputPath: string,
): Promise<void> => {
  const output = createWriteStream(outputPath, "utf8");
  const lines = mergeAssetMapLines(
    shards.map(({ path, root }) => ({ lines: readFileLines(path), root })),
    gameRoot,
  );
  for await (const line of lines) if (!output.write(`${line}\n`)) await once(output, "drain");
  output.end();
  await once(output, "finish");
};
