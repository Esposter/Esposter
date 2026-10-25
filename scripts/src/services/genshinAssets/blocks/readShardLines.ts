import type { AssetMapLines } from "#src/models/genshinAssets/shared/AssetMapLines";

import { tagShardLines } from "#src/services/genshinAssets/blocks/tagShardLines";

// Every shard's lines in turn, each tagged with its shard, so one loop reads the whole merge
export const readShardLines = async function* (
  shards: AssetMapLines[],
): AsyncGenerator<{ index: number; line: string; root: string }> {
  for (const [index, { lines, root }] of shards.entries()) yield* tagShardLines(lines, index, root);
};
