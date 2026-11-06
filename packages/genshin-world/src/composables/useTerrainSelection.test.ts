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
  const createSelection = () => {
    const requestTile = vi.fn<(key: number) => void>();
    const tileStreamer = createTileStreamer({
      disposeTile: vi.fn<(tile: number) => void>(),
      maxCachedCount: 64,
      maxPendingCount: 1,
      requestTile,
    });
    return {
      requestTile,
      tileStreamer,
      ...useTerrainSelection({
        draws: createTerrainSelection(64),
        endRefresh: vi.fn<(checkIsSettled: () => boolean) => void>(),
        isGroundSettled: true,
        onReady: vi.fn<() => void>(),
        terrainOptions,
        tileStreamer,
      }),
    };
  };
  const requestedKeys = (selection: ReturnType<typeof createSelection>) =>
    selection.requestTile.mock.calls.map(([key]) => key);
  // Selects from the camera a frame at a time, giving each tile asked for, so the view ends on the ground it wants
  const streamFrames = (selection: ReturnType<typeof createSelection>, camera: PerspectiveCamera) => {
    for (let frame = 0; frame < frameLimit; frame++) {
      selection.select(camera, new Vector3());
      for (const key of requestedKeys(selection))
        if (!selection.tileStreamer.has(key)) selection.tileStreamer.receive(key, key);
    }
  };

  test("a settled read reports tiles in flight", () => {
    expect.hasAssertions();

    const selection = createSelection();
    const camera = new PerspectiveCamera();
    camera.position.set(0.5, 0, 0.5);
    selection.select(camera, new Vector3());
    const isSettledWhileInFlight = selection.checkIsSettled();
    // The one tile asked for is given, so nothing is in flight, but the view's other tiles have not been asked for yet
    const firstKey = takeOne(requestedKeys(selection), 0);
    selection.tileStreamer.receive(firstKey, firstKey);
    const isSettledWhileUnasked = selection.checkIsSettled();
    streamFrames(selection, camera);

    expect({ isSettled: selection.checkIsSettled(), isSettledWhileInFlight, isSettledWhileUnasked }).toStrictEqual({
      isSettled: true,
      isSettledWhileInFlight: false,
      isSettledWhileUnasked: false,
    });
  });

  test("a settled read is false while a tile the view moved on from is still generating", () => {
    expect.hasAssertions();

    const selection = createSelection();
    const homeCamera = new PerspectiveCamera();
    homeCamera.position.set(0.5, 0, 0.5);
    const awayCamera = new PerspectiveCamera();
    awayCamera.position.set(-0.5, 0, -0.5);
    streamFrames(selection, homeCamera);
    // The view moves away and asks for a tile the home view does not hold, which stays generating, then moves back to
    // The ground it already holds, so the view is settled while that tile is still in flight
    selection.select(awayCamera, new Vector3());
    selection.select(homeCamera, new Vector3());

    expect({
      isSettledWhileGenerating: selection.checkIsSettled(),
      pendingCount: selection.tileStreamer.pendingCount(),
    }).toStrictEqual({ isSettledWhileGenerating: false, pendingCount: 1 });
  });
});
