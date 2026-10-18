import type { PlantedTerrainTile } from "#src/models/PlantedTerrainTile";
import type { TerrainWorkerMessage } from "#src/models/world/TerrainWorkerMessage";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { regionGroundSchema } from "#src/models/world/RegionGround";
import { TerrainWorkerMessageKind } from "#src/models/world/TerrainWorkerMessageKind";
import { readGameData } from "#src/services/data/readGameData";
import { readWindriseData } from "#src/services/windrise/readWindriseData";
import { checkIsGameDataKey } from "#src/services/data/checkIsGameDataKey";
import { gameDataLock } from "#src/services/data/gameDataLock";
import { selectLaidGroundKeys } from "#src/services/world/selectLaidGroundKeys";
import { createWorldHeight } from "#src/services/world/createWorldHeight";
import { SOURCE_CONDITION } from "@esposter/configuration";
import { getTerrainTileKey, TerrainFeatureKind } from "genshin-engine";
import { isAbsolute, resolve } from "node:path";
import { scan } from "rolldown/experimental";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

const { baseGround, groundLayers, surfaces, water } = await readWindriseData(GAME_DATA_LOCAL_BASE_URL);
const regionGrounds = await Promise.all(
  selectLaidGroundKeys(Object.keys(gameDataLock.objects).filter((key) => checkIsGameDataKey(key))).map((key) =>
    readGameData(GAME_DATA_LOCAL_BASE_URL, key, regionGroundSchema),
  ),
);

describe("terrainTile.worker", () => {
  const addEventListener =
    vi.fn<(type: string, listener: (event: MessageEvent<TerrainWorkerMessage>) => Promise<void> | void) => void>();
  const postMessage = vi.fn<(message: PlantedTerrainTile, options: StructuredSerializeOptions) => void>();
  const tileMessage: TerrainWorkerMessage = {
    kind: TerrainWorkerMessageKind.Tile,
    request: { cellsPerSide: 1, finestTileSize: 1, key: getTerrainTileKey(0, 0, 0) },
  };
  const loadMessage: TerrainWorkerMessage = {
    ground: { baseGround, groundLayers, surfaces, waterLevel: water.level },
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

    const getGroundHeight = createWorldHeight(baseGround, []);
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

  test("raises a tile asked for after the regions' grounds arrive by them", async () => {
    expect.hasAssertions();

    const [plateau] = regionGrounds.flatMap(({ features }) =>
      features.flatMap((feature) => (feature.kind === TerrainFeatureKind.Plateau ? [feature] : [])),
    );
    assert.exists(plateau);
    const x = Math.round(plateau.x);
    const z = Math.round(plateau.z);
    const getGroundHeight = createWorldHeight(baseGround, regionGrounds);
    await receive(loadMessage);
    await receive({ kind: TerrainWorkerMessageKind.RegionGrounds, regionGrounds });
    await receive({
      kind: TerrainWorkerMessageKind.Tile,
      request: { cellsPerSide: 1, finestTileSize: 1, key: getTerrainTileKey(0, x, z) },
    });

    assert.exists(postMessage.mock.lastCall);
    expect(postMessage.mock.lastCall[0].positions).toStrictEqual(
      new Float32Array([
        0,
        getGroundHeight(x, z),
        0,
        1,
        getGroundHeight(x + 1, z),
        0,
        0,
        getGroundHeight(x, z + 1),
        1,
        1,
        getGroundHeight(x + 1, z + 1),
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
