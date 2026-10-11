import type { TMXPendingTileData } from "#src/models/tmx/TMXPendingTileData";

import { parseFlips } from "#src/services/parseFlips";
import { parseTileId } from "#src/services/parseTileId";
import { decodeTileData } from "#src/services/decodeTileData";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every queued layer and chunk takes its decoded cells. Chunked data is skipped, since its cells are in its chunks.
export const assignTileData = async (pending: TMXPendingTileData[], translateFlips: boolean): Promise<void> => {
  await Promise.all(
    pending.map(async ({ expectedCount, owner, source }) => {
      if (source.chunked) return;

      const tiles = await decodeTileData(source);
      if (expectedCount !== undefined && tiles.length !== expectedCount)
        throw new InvalidOperationError(
          Operation.Read,
          "TMXLayer",
          `expected ${expectedCount} tiles, received ${tiles.length}`,
        );

      if (translateFlips) {
        owner.data = tiles.map((gid) => parseTileId(gid));
        owner.flips = tiles.map((gid) => parseFlips(gid));
      } else owner.data = tiles;
    }),
  );
};
