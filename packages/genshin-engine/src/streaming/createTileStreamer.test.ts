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
    const whileRefreshing = { isSettled: tileStreamer.checkIsSettled(fineKey), tile: tileStreamer.get(fineKey) };
    tileStreamer.receive(fineKey, 1);

    expect({
      disposed: disposeTile.mock.calls,
      isSettled: tileStreamer.checkIsSettled(fineKey),
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

    expect({ isSettled: tileStreamer.checkIsSettled(fineKey), requested: requestTile.mock.calls }).toStrictEqual({
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

    expect({ isSettled: tileStreamer.checkIsSettled(otherFineKey), requested: requestTile.mock.calls }).toStrictEqual({
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

  test("counts a failed tile as in flight until an update asks for it again or drops it", () => {
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
    tileStreamer.fail(fineKey);
    const beforeUpdate = tileStreamer.pendingCount();
    tileStreamer.update(wanted, emptySelection, emptySelection);
    const afterRequest = tileStreamer.pendingCount();
    tileStreamer.fail(fineKey);
    tileStreamer.update(emptySelection, emptySelection, emptySelection);

    expect({ afterDrop: tileStreamer.pendingCount(), afterRequest, beforeUpdate }).toStrictEqual({
      afterDrop: 0,
      afterRequest: 1,
      beforeUpdate: 1,
    });
  });

  test("drops a failed tile that is only drawn as a fallback, since no update asks for it", () => {
    expect.hasAssertions();

    const requestTile = vi.fn<(key: number) => void>();
    const tileStreamer = createTileStreamer({
      disposeTile: vi.fn<(tile: number) => void>(),
      maxCachedCount: 2,
      maxPendingCount: 1,
      requestTile,
    });
    const wanted = createTerrainSelection(1);
    wanted.keys.set([fineKey]);
    wanted.count = 1;
    tileStreamer.update(wanted, emptySelection, emptySelection);
    tileStreamer.fail(fineKey);
    const drawn = createTerrainSelection(1);
    drawn.keys.set([fineKey]);
    drawn.count = 1;
    tileStreamer.update(emptySelection, drawn, emptySelection);

    expect({ count: tileStreamer.pendingCount(), requested: requestTile.mock.calls }).toStrictEqual({
      count: 0,
      requested: [[fineKey]],
    });
  });

  test("keeps a failed tile counted while it is still wanted but no slot is free to ask for it again", () => {
    expect.hasAssertions();

    const requestTile = vi.fn<(key: number) => void>();
    const tileStreamer = createTileStreamer({
      disposeTile: vi.fn<(tile: number) => void>(),
      maxCachedCount: 2,
      maxPendingCount: 1,
      requestTile,
    });
    const wanted = createTerrainSelection(1);
    wanted.keys.set([fineKey]);
    wanted.count = 1;
    tileStreamer.update(wanted, emptySelection, emptySelection);
    tileStreamer.fail(fineKey);
    // The coarser tile takes the only slot, so the failed one is still wanted but cannot be asked for this update
    const coarserWanted = createTerrainSelection(2);
    coarserWanted.keys.set([fineKey, coarseKey]);
    coarserWanted.count = 2;
    tileStreamer.update(coarserWanted, emptySelection, emptySelection);

    expect({ count: tileStreamer.pendingCount(), requested: requestTile.mock.calls }).toStrictEqual({
      count: 2,
      requested: [[fineKey], [coarseKey]],
    });
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
      isSettled: tileStreamer.checkIsSettled(fineKey),
      requestCount: requestTile.mock.calls.length,
    }).toStrictEqual({ givenUp: [false, false, true], isSettled: true, requestCount: MAX_TILE_ATTEMPTS });
  });
});
