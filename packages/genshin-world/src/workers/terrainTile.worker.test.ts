import type { PlantedTerrainTile } from "#src/models/PlantedTerrainTile";
import type { TerrainWorkerMessage } from "#src/models/world/TerrainWorkerMessage";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { TerrainWorkerMessageKind } from "#src/models/world/TerrainWorkerMessageKind";
import { readWindriseData } from "#src/services/windrise/readWindriseData";
import { createWorldHeight } from "#src/services/world/createWorldHeight";
import { getTerrainTileKey } from "genshin-engine";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

const { baseGround, groundLayers, regionGrounds, surfaces, water } = await readWindriseData(GAME_DATA_LOCAL_BASE_URL);

describe("terrainTile.worker", () => {
  const addEventListener =
    vi.fn<(type: string, listener: (event: MessageEvent<TerrainWorkerMessage>) => void) => void>();
  const postMessage = vi.fn<(message: PlantedTerrainTile, options: StructuredSerializeOptions) => void>();
  const tileMessage: TerrainWorkerMessage = {
    kind: TerrainWorkerMessageKind.Tile,
    request: { cellsPerSide: 1, finestTileSize: 1, key: getTerrainTileKey(0, 0, 0) },
  };
  const receive = (message: TerrainWorkerMessage): void => {
    assert.exists(addEventListener.mock.lastCall);
    addEventListener.mock.lastCall[1](new MessageEvent("message", { data: message }));
  };

  beforeEach(async () => {
    vi.stubGlobal("self", { addEventListener, postMessage });
    // Imported afresh for each test, so each starts a worker with no ground loaded
    vi.resetModules();
    await import("#src/workers/terrainTile.worker");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("refuses a tile asked for before its ground is loaded", () => {
    expect.hasAssertions();

    expect(() => {
      receive(tileMessage);
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: A terrain tile was asked for before the worker's ground was loaded]`,
    );
  });

  test("computes a tile's heights over the ground it was loaded with", () => {
    expect.hasAssertions();

    const getGroundHeight = createWorldHeight(baseGround, regionGrounds);
    receive({
      ground: { baseGround, groundLayers, regionGrounds, surfaces, waterLevel: water.level },
      kind: TerrainWorkerMessageKind.Load,
    });
    receive(tileMessage);

    assert.exists(postMessage.mock.lastCall);
    expect(postMessage.mock.lastCall[0].positions).toStrictEqual(
      new Float32Array([
        0,
        getGroundHeight(0, 0),
        0,
        1,
        getGroundHeight(1, 0),
        0,
        0,
        getGroundHeight(0, 1),
        1,
        1,
        getGroundHeight(1, 1),
        1,
      ]),
    );
  });
});
