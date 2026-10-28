import type { AssetMapLines } from "#src/models/genshinAssets/shared/AssetMapLines";

import { closeEntry } from "#src/services/genshinAssets/blocks/closeEntry";
import { SOURCE_PREFIX } from "#src/services/genshinAssets/blocks/constants";
import { readShardLines } from "#src/services/genshinAssets/blocks/readShardLines";
import { rebaseSource } from "#src/services/genshinAssets/blocks/rebaseSource";
import { toEscaped } from "#src/services/genshinAssets/blocks/toEscaped";

// AnimeStudio's asset map merged from its shards' lines, which hold one entry a block of them. The first shard's header
// And trailer are kept, every shard's entries follow in turn, and each entry's source is rebased from its shard's
// Blocks Folder to the installed blocks' one, since AnimeStudio writes the folder it was given. The lines are read
// One at a Time, the map too large to hold whole
const ENTRIES_OPENING = '"AssetEntries": [';
const ENTRIES_CLOSING = "]";

export const mergeAssetMapLines = async function* (
  shards: AssetMapLines[],
  blocksRoot: string,
): AsyncGenerator<string> {
  const to = toEscaped(blocksRoot);
  const trailer: string[] = [];
  // The last entry read, held until the entry after it shows whether it takes a comma
  let previous: string[] | undefined;
  let shardIndex = -1;
  let from = "";
  let isInEntries = false;
  let isInTrailer = false;
  let entry: string[] | undefined;
  for await (const { index, line, root } of readShardLines(shards)) {
    if (index !== shardIndex) {
      shardIndex = index;
      from = toEscaped(root);
      isInEntries = false;
      isInTrailer = false;
      entry = undefined;
    }
    const trimmed = line.trim();
    if (!isInEntries) {
      if (index === 0) yield line;
      if (trimmed === ENTRIES_OPENING) isInEntries = true;
    } else if (isInTrailer) {
      if (index === 0) trailer.push(line);
    } else if (entry) {
      entry.push(trimmed.startsWith(SOURCE_PREFIX) ? rebaseSource(line, from, to, root) : line);
      if (trimmed.startsWith("}")) {
        if (previous) yield* closeEntry(previous, true);
        previous = entry;
        entry = undefined;
      }
    } else if (trimmed.startsWith("{")) entry = [line];
    else if (trimmed === ENTRIES_CLOSING) {
      isInTrailer = true;
      if (index === 0) trailer.push(line);
    }
  }
  if (previous) yield* closeEntry(previous, false);
  yield* trailer;
};
