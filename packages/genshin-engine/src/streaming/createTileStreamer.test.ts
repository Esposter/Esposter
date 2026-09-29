import { createTileStreamer } from "#src/streaming/createTileStreamer";
import { createTerrainSelection } from "#src/terrain/createTerrainSelection";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { describe, expect, test, vi } from "vitest";

describe(createTileStreamer, () => {
  const coarseKey = getTerrainTileKey(1, 0, 0);
  const fineKey = getTerrainTileKey(0, 0, 0);

  test("asks for the coarsest missing tile first, no more than the pending limit", () => {
    expect.hasAssertions();

    const requestTile = vi.fn<(key: number) => void>();
    const tileStreamer = createTileStreamer({
      disposeTile: vi.fn(),
      maxCachedCount: 1,
      maxPendingCount: 1,
      requestTile,
    });
    const wanted = createTerrainSelection(2);
    wanted.keys.set([fineKey, coarseKey]);
    wanted.count = 2;
    tileStreamer.update(wanted);

    expect(requestTile.mock.calls).toStrictEqual([[coarseKey]]);
  });

  test("frees the tile wanted longest ago once the cache is full", () => {
    expect.hasAssertions();

    const disposeTile = vi.fn<(tile: number) => void>();
    const tileStreamer = createTileStreamer({
      disposeTile,
      maxCachedCount: 1,
      maxPendingCount: 1,
      requestTile: vi.fn(),
    });
    tileStreamer.receive(coarseKey, 1);
    const wanted = createTerrainSelection(1);
    wanted.keys.set([fineKey]);
    wanted.count = 1;
    tileStreamer.update(wanted);
    tileStreamer.receive(fineKey, 0);

    expect({ disposed: disposeTile.mock.calls, hasFine: tileStreamer.has(fineKey) }).toStrictEqual({
      disposed: [[1]],
      hasFine: true,
    });
  });
});
