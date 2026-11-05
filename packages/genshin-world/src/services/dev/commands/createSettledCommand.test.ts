import { createSettledCommand } from "#src/services/dev/commands/createSettledCommand";
import { createTerrainSelection, createTileStreamer, getTerrainTileKey } from "genshin-engine";
import { describe, expect, test, vi } from "vitest";

describe(createSettledCommand, () => {
  const tileKey = getTerrainTileKey(0, 0, 0);
  const emptySelection = createTerrainSelection(0);

  test("A settled read reports tiles in flight", () => {
    expect.hasAssertions();

    const tileStreamer = createTileStreamer({
      disposeTile: vi.fn<(tile: number) => void>(),
      maxCachedCount: 1,
      maxPendingCount: 1,
      requestTile: vi.fn<(key: number) => void>(),
    });
    const settledCommand = createSettledCommand({ getPendingCount: () => tileStreamer.pendingCount() });
    const wanted = createTerrainSelection(1);
    wanted.keys.set([tileKey]);
    wanted.count = 1;
    tileStreamer.update(wanted, emptySelection, emptySelection);
    const inFlight = settledCommand.run({});
    tileStreamer.receive(tileKey, tileKey);
    const given = settledCommand.run({});

    expect({ given, inFlight }).toStrictEqual({
      given: { ok: true, value: true },
      inFlight: { ok: true, value: false },
    });
  });
});
