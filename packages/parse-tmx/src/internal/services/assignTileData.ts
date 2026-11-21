import type { TMXPendingTileData } from "#src/internal/models/tmx/TMXPendingTileData";

import { decodeTileData } from "#src/internal/services/decodeTileData";
import { parseFlips } from "#src/internal/services/parseFlips";
import { parseTileId } from "#src/internal/services/parseTileId";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every queued layer and chunk takes its decoded cells. Chunked data is skipped, since its cells are in its chunks.
export const assignTileData = async (pending: TMXPendingTileData[], isTranslateFlips: boolean): Promise<void> => {
  await Promise.all(
    pending.map(async ({ expectedCount, owner, source }) => {
      if (source.chunked) return;

      const tiles = await decodeTileData(source);
      if (tiles.length !== expectedCount)
        throw new InvalidOperationError(
          Operation.Read,
          "TMXLayer",
          `expected ${expectedCount} tiles, received ${tiles.length}`,
        );

      if (isTranslateFlips) {
        owner.data = tiles.map((gid) => parseTileId(gid));
        owner.flips = tiles.map((gid) => parseFlips(gid));
      } else owner.data = tiles;
    }),
  );
};
