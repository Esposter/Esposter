import type { PlantedTerrainTile } from "#src/models/PlantedTerrainTile";
import type { TerrainWorkerMessage } from "#src/models/world/TerrainWorkerMessage";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { TerrainWorkerMessageKind } from "#src/models/world/TerrainWorkerMessageKind";
import { readWindriseData } from "#src/services/windrise/readWindriseData";
import { createWorldHeight } from "#src/services/world/createWorldHeight";
import { SOURCE_CONDITION } from "@esposter/configuration";
import { getTerrainTileKey } from "genshin-engine";
import { isAbsolute, resolve } from "node:path";
import { scan } from "rolldown/experimental";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

const { baseGround, groundLayers, regionGrounds, surfaces, water } = await readWindriseData(GAME_DATA_LOCAL_BASE_URL);

describe("terrainTile.worker", () => {
  const addEventListener =
    vi.fn<(type: string, listener: (event: MessageEvent<TerrainWorkerMessage>) => Promise<void> | void) => void>();
  const postMessage = vi.fn<(message: PlantedTerrainTile, options: StructuredSerializeOptions) => void>();
  const tileMessage: TerrainWorkerMessage = {
    kind: TerrainWorkerMessageKind.Tile,
    request: { cellsPerSide: 1, finestTileSize: 1, key: getTerrainTileKey(0, 0, 0) },
  };
  const loadMessage: TerrainWorkerMessage = {
    ground: { baseGround, groundLayers, regionGrounds, surfaces, waterLevel: water.level },
    kind: TerrainWorkerMessageKind.Load,
  };
  const receive = async (message: TerrainWorkerMessage): Promise<void> => {
    assert.exists(addEventListener.mock.lastCall);
    await addEventListener.mock.lastCall[1](new MessageEvent("message", { data: message }));
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

  test("answers a tile asked for before its ground is loaded once the ground arrives", async () => {
    expect.hasAssertions();

    await receive(tileMessage);
    const postedBeforeLoad = postMessage.mock.calls.length;
    await receive(loadMessage);

    expect({ postedAfterLoad: postMessage.mock.calls.length, postedBeforeLoad }).toStrictEqual({
      postedAfterLoad: 1,
      postedBeforeLoad: 0,
    });
  });

  test("computes a tile's heights over the ground it was loaded with", async () => {
    expect.hasAssertions();

    const getGroundHeight = createWorldHeight(baseGround, regionGrounds);
    await receive(loadMessage);
    await receive(tileMessage);

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

  test("imports no package but three, reaching the engine through its generators alone", async () => {
    expect.hasAssertions();

    const moduleIds: string[] = [];
    await scan({
      // Every bare specifier but the engine's is left as its name, so the names in the graph are the packages it loads
      external: (id, _importer, isResolved) =>
        !isResolved && !isAbsolute(id) && /^[\w@]/u.test(id) && !id.startsWith("genshin-engine"),
      input: resolve(import.meta.dirname, "terrainTile.worker.ts"),
      plugins: [
        {
          buildEnd() {
            moduleIds.push(...this.getModuleIds());
          },
          name: "module-ids",
        },
      ],
      resolve: { conditionNames: [SOURCE_CONDITION, "import", "default"] },
    });

    expect(moduleIds.filter((id) => !isAbsolute(id))).toStrictEqual(["three"]);
  });
});
