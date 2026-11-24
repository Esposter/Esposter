import type { TerrainSelection } from "#src/models/terrain/TerrainSelection";

import { createTileStreamer } from "#src/streaming/createTileStreamer";
import { createTerrainSelection } from "#src/terrain/createTerrainSelection";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A view that wants a few tiles and one that wants many: a frame's cost follows the tiles it names, never the world
const BENCH_TILE_COUNTS = [64, 1024];
const noop = () => {};

// `count` distinct tiles along one row of a level, so each key is its own tile
const createKeys = (level: number, count: number): number[] =>
  Array.from({ length: count }, (_value, column) => getTerrainTileKey(level, column, 0));

const createSelection = (keys: number[]): TerrainSelection => {
  const selection = createTerrainSelection(keys.length);
  selection.keys.set(keys);
  selection.count = keys.length;
  return selection;
};

// Each scale's streamer is built once and its frame repeated: a frame that holds or still waits on the same tiles
// Leaves the streamer as it found it, so every iteration is the same frame
describe(createTileStreamer, () => {
  test.for(BENCH_TILE_COUNTS)("%i tiles a frame", async (count, { bench }) => {
    const wanted = createSelection(createKeys(0, count));
    const surrounding = createSelection(createKeys(1, count));
    const drawn = createTerrainSelection(0);
    const heldStreamer = createTileStreamer<number>({
      disposeTile: noop,
      maxCachedCount: count * 2,
      maxPendingCount: count,
      requestTile: noop,
    });
    for (const key of [...wanted.keys.subarray(0, count), ...surrounding.keys.subarray(0, count)])
      heldStreamer.receive(key, key);
    const pendingStreamer = createTileStreamer<number>({
      disposeTile: noop,
      maxCachedCount: count,
      maxPendingCount: count,
      requestTile: noop,
    });
    pendingStreamer.update(wanted, drawn, surrounding);

    await bench.compare(
      bench("every tile held", () => {
        heldStreamer.update(wanted, drawn, surrounding);
      }),
      bench("every tile still generating", () => {
        pendingStreamer.update(wanted, drawn, surrounding);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
