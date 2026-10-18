import { MAX_TILE_ATTEMPTS } from "#src/streaming/constants";
import { createTileStreamer } from "#src/streaming/createTileStreamer";
import { createTerrainSelection } from "#src/terrain/createTerrainSelection";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { describe, expect, test, vi } from "vitest";

describe(createTileStreamer, () => {
  const coarseKey = getTerrainTileKey(1, 0, 0);
  const fineKey = getTerrainTileKey(0, 0, 0);
  const otherFineKey = getTerrainTileKey(0, 1, 0);
  const emptySelection = createTerrainSelection(0);

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
    tileStreamer.update(wanted, emptySelection, emptySelection);

    expect(requestTile.mock.calls).toStrictEqual([[coarseKey]]);
  });

  test("asks for the tiles round the view once every tile it wants is asked for", () => {
    expect.hasAssertions();

    const requestTile = vi.fn<(key: number) => void>();
    const tileStreamer = createTileStreamer({
      disposeTile: vi.fn<(tile: number) => void>(),
      maxCachedCount: 2,
      maxPendingCount: 2,
      requestTile,
    });
    const wanted = createTerrainSelection(1);
    wanted.keys.set([fineKey]);
    wanted.count = 1;
    const surrounding = createTerrainSelection(2);
    surrounding.keys.set([fineKey, coarseKey]);
    surrounding.count = 2;
    tileStreamer.update(wanted, emptySelection, surrounding);

    expect(requestTile.mock.calls).toStrictEqual([[fineKey], [coarseKey]]);
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
    tileStreamer.update(wanted, emptySelection, emptySelection);
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
    tileStreamer.update(wanted, drawn, emptySelection);
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
    tileStreamer.update(wanted, emptySelection, emptySelection);
    wanted.keys.set([coarseKey]);
    tileStreamer.update(wanted, emptySelection, emptySelection);
    tileStreamer.receive(coarseKey, 1);
    tileStreamer.receive(fineKey, 0);

    expect({ disposed: disposeTile.mock.calls, hasCoarse: tileStreamer.has(coarseKey) }).toStrictEqual({
      disposed: [[0]],
      hasCoarse: true,
    });
  });

  test("asks again for a held tile after a refresh, drawing it until its replacement arrives", () => {
    expect.hasAssertions();

    const disposeTile = vi.fn<(tile: number) => void>();
    const requestTile = vi.fn<(key: number) => void>();
    const tileStreamer = createTileStreamer({ disposeTile, maxCachedCount: 1, maxPendingCount: 1, requestTile });
    tileStreamer.receive(fineKey, 0);
    tileStreamer.refresh(() => true);
    const wanted = createTerrainSelection(1);
    wanted.keys.set([fineKey]);
    wanted.count = 1;
    tileStreamer.update(wanted, emptySelection, emptySelection);
    const whileRefreshing = { isSettled: tileStreamer.isSettled(fineKey), tile: tileStreamer.get(fineKey) };
    tileStreamer.receive(fineKey, 1);

    expect({
      disposed: disposeTile.mock.calls,
      isSettled: tileStreamer.isSettled(fineKey),
      requested: requestTile.mock.calls,
      tile: tileStreamer.get(fineKey),
      whileRefreshing,
    }).toStrictEqual({
      disposed: [[0]],
      isSettled: true,
      requested: [[fineKey]],
      tile: 1,
      whileRefreshing: { isSettled: false, tile: 0 },
    });
  });

  test("asks again for a tile generating when a refresh came, once it arrives", () => {
    expect.hasAssertions();

    const requestTile = vi.fn<(key: number) => void>();
    const tileStreamer = createTileStreamer({
      disposeTile: vi.fn<(tile: number) => void>(),
      maxCachedCount: 1,
      maxPendingCount: 1,
      requestTile,
    });
    const wanted = createTerrainSelection(1);
    wanted.keys.set([fineKey]);
    wanted.count = 1;
    tileStreamer.update(wanted, emptySelection, emptySelection);
    tileStreamer.refresh(() => true);
    tileStreamer.receive(fineKey, 0);
    tileStreamer.update(wanted, emptySelection, emptySelection);

    expect({ isSettled: tileStreamer.isSettled(fineKey), requested: requestTile.mock.calls }).toStrictEqual({
      isSettled: false,
      requested: [[fineKey], [fineKey]],
    });
  });

  test("asks again only for the tiles a refresh names, held or generating", () => {
    expect.hasAssertions();

    const requestTile = vi.fn<(key: number) => void>();
    const tileStreamer = createTileStreamer({
      disposeTile: vi.fn<(tile: number) => void>(),
      maxCachedCount: 3,
      maxPendingCount: 3,
      requestTile,
    });
    const wanted = createTerrainSelection(3);
    wanted.keys.set([coarseKey, fineKey, otherFineKey]);
    wanted.count = 3;
    tileStreamer.update(wanted, emptySelection, emptySelection);
    tileStreamer.receive(fineKey, 0);
    tileStreamer.receive(otherFineKey, 1);
    tileStreamer.refresh((key) => key !== otherFineKey);
    tileStreamer.receive(coarseKey, 2);
    tileStreamer.update(wanted, emptySelection, emptySelection);

    expect({ isSettled: tileStreamer.isSettled(otherFineKey), requested: requestTile.mock.calls }).toStrictEqual({
      isSettled: true,
      requested: [[coarseKey], [fineKey], [otherFineKey], [coarseKey], [fineKey]],
    });
  });

  test("frees the slot of a failed tile so the next wanted tile is requested", () => {
    expect.hasAssertions();

    const requestTile = vi.fn<(key: number) => void>();
    const tileStreamer = createTileStreamer({
      disposeTile: vi.fn<(tile: number) => void>(),
      maxCachedCount: 1,
      maxPendingCount: 1,
      requestTile,
    });
    const wanted = createTerrainSelection(2);
    wanted.keys.set([fineKey, otherFineKey]);
    wanted.count = 2;
    tileStreamer.update(wanted, emptySelection, emptySelection);
    tileStreamer.fail(fineKey);
    tileStreamer.update(wanted, emptySelection, emptySelection);

    expect(requestTile.mock.calls).toStrictEqual([[fineKey], [fineKey]]);
  });

  test("gives up a tile failed MAX_TILE_ATTEMPTS times, which then counts as settled", () => {
    expect.hasAssertions();

    const requestTile = vi.fn<(key: number) => void>();
    const tileStreamer = createTileStreamer({
      disposeTile: vi.fn<(tile: number) => void>(),
      maxCachedCount: 1,
      maxPendingCount: 1,
      requestTile,
    });
    const wanted = createTerrainSelection(1);
    wanted.keys.set([fineKey]);
    wanted.count = 1;
    const givenUp = Array.from({ length: MAX_TILE_ATTEMPTS }, () => {
      tileStreamer.update(wanted, emptySelection, emptySelection);
      return tileStreamer.fail(fineKey);
    });
    tileStreamer.update(wanted, emptySelection, emptySelection);

    expect({
      givenUp,
      isSettled: tileStreamer.isSettled(fineKey),
      requestCount: requestTile.mock.calls.length,
    }).toStrictEqual({ givenUp: [false, false, true], isSettled: true, requestCount: MAX_TILE_ATTEMPTS });
  });
});
