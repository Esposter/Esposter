import { createTileStreamer } from "#src/streaming/createTileStreamer";
import { createTerrainSelection } from "#src/terrain/createTerrainSelection";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { describe, expect, test, vi } from "vitest";

describe(createTileStreamer, () => {
  const coarseKey = getTerrainTileKey(1, 0, 0);
  const fineKey = getTerrainTileKey(0, 0, 0);
  const otherFineKey = getTerrainTileKey(0, 1, 0);

  test("asks for the coarsest missing tile first, no more than the pending limit", () => {
    expect.hasAssertions();

    const requestTile = vi.fn<(key: number) => void>();
    const tileStreamer = createTileStreamer({
      disposeTile: vi.fn<(tile: number) => void>(),
      maxCachedCount: 1,
      maxPendingCount: 1,
      requestTile,
    });
    const wanted = createTerrainSelection(2);
    wanted.keys.set([fineKey, coarseKey]);
    wanted.count = 2;
    tileStreamer.update(wanted, createTerrainSelection(0));

    expect(requestTile.mock.calls).toStrictEqual([[coarseKey]]);
  });

  test("frees the tile wanted longest ago once the cache is full", () => {
    expect.hasAssertions();

    const disposeTile = vi.fn<(tile: number) => void>();
    const tileStreamer = createTileStreamer({
      disposeTile,
      maxCachedCount: 1,
      maxPendingCount: 1,
      requestTile: vi.fn<(key: number) => void>(),
    });
    tileStreamer.receive(coarseKey, 1);
    const wanted = createTerrainSelection(1);
    wanted.keys.set([fineKey]);
    wanted.count = 1;
    tileStreamer.update(wanted, createTerrainSelection(0));
    tileStreamer.receive(fineKey, 0);

    expect({ disposed: disposeTile.mock.calls, hasFine: tileStreamer.has(fineKey) }).toStrictEqual({
      disposed: [[1]],
      hasFine: true,
    });
  });

  test("keeps an ancestor drawn in place of a missing tile", () => {
    expect.hasAssertions();

    const disposeTile = vi.fn<(tile: number) => void>();
    const tileStreamer = createTileStreamer({
      disposeTile,
      maxCachedCount: 2,
      maxPendingCount: 1,
      requestTile: vi.fn<(key: number) => void>(),
    });
    tileStreamer.receive(coarseKey, 1);
    tileStreamer.receive(otherFineKey, 2);
    const wanted = createTerrainSelection(1);
    wanted.keys.set([fineKey]);
    wanted.count = 1;
    const drawn = createTerrainSelection(1);
    drawn.keys.set([coarseKey]);
    drawn.count = 1;
    tileStreamer.update(wanted, drawn);
    tileStreamer.receive(fineKey, 0);

    expect({ disposed: disposeTile.mock.calls, hasCoarse: tileStreamer.has(coarseKey) }).toStrictEqual({
      disposed: [[2]],
      hasCoarse: true,
    });
  });

  test("frees a tile no longer wanted by the time it arrives first", () => {
    expect.hasAssertions();

    const disposeTile = vi.fn<(tile: number) => void>();
    const tileStreamer = createTileStreamer({
      disposeTile,
      maxCachedCount: 1,
      maxPendingCount: 1,
      requestTile: vi.fn<(key: number) => void>(),
    });
    const wanted = createTerrainSelection(1);
    wanted.keys.set([fineKey]);
    wanted.count = 1;
    tileStreamer.update(wanted, createTerrainSelection(0));
    wanted.keys.set([coarseKey]);
    tileStreamer.update(wanted, createTerrainSelection(0));
    tileStreamer.receive(coarseKey, 1);
    tileStreamer.receive(fineKey, 0);

    expect({ disposed: disposeTile.mock.calls, hasCoarse: tileStreamer.has(coarseKey) }).toStrictEqual({
      disposed: [[0]],
      hasCoarse: true,
    });
  });
});
