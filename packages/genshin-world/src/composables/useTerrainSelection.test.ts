import type { TerrainOptions } from "genshin-engine";

import { useTerrainSelection } from "#src/composables/useTerrainSelection";
import { takeOne } from "@esposter/shared";
import { createTerrainSelection, createTileStreamer } from "genshin-engine";
import { PerspectiveCamera, Vector3 } from "three";
import { describe, expect, test, vi } from "vitest";

describe(useTerrainSelection, () => {
  const terrainOptions: TerrainOptions = {
    cellsPerSide: 2,
    finestRange: 2,
    finestTileSize: 1,
    levelCount: 2,
    maxHeight: 0,
    minHeight: 0,
  };
  // Enough frames for the view to ask for every tile it wants and the ones round it, one a frame
  const frameLimit = 64;

  test("a settled read reports tiles in flight", () => {
    expect.hasAssertions();

    const requestTile = vi.fn<(key: number) => void>();
    const tileStreamer = createTileStreamer({
      disposeTile: vi.fn<(tile: number) => void>(),
      maxCachedCount: 64,
      maxPendingCount: 1,
      requestTile,
    });
    const { checkIsSettled, select } = useTerrainSelection({
      draws: createTerrainSelection(64),
      endRefresh: vi.fn<(checkIsSettled: () => boolean) => void>(),
      isGroundSettled: true,
      onReady: vi.fn<() => void>(),
      terrainOptions,
      tileStreamer,
    });
    const camera = new PerspectiveCamera();
    camera.position.set(0.5, 0, 0.5);
    const requestedKeys = () => requestTile.mock.calls.map(([key]) => key);
    select(camera, new Vector3());
    const inFlight = checkIsSettled();
    // The one tile asked for is given, so nothing is in flight, but the view's other tiles have not been asked for yet
    const firstKey = takeOne(requestedKeys(), 0);
    tileStreamer.receive(firstKey, firstKey);
    const notAskedFor = checkIsSettled();
    for (let frame = 0; frame < frameLimit; frame++) {
      select(camera, new Vector3());
      for (const key of requestedKeys()) if (!tileStreamer.has(key)) tileStreamer.receive(key, key);
    }

    expect({ inFlight, notAskedFor, settled: checkIsSettled() }).toStrictEqual({
      inFlight: false,
      notAskedFor: false,
      settled: true,
    });
  });
});
