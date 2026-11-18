import type { Catalogue } from "#src/models/world/Catalogue";
import type { LoadedRegion } from "#src/models/world/LoadedRegion";
import type { useLoop, useTres } from "@tresjs/core";
import type { GroundPoint } from "genshin-engine";

import { useRegionData } from "#src/composables/useRegionData";
import { ChestKind } from "#src/models/chest/ChestKind";
import { WorldLayer } from "#src/models/world/WorldLayer";
import { readRegionChestPlaces } from "#src/services/chest/readRegionChestPlaces";
import { readLoadedRegion } from "#src/services/world/readLoadedRegion";
import { Vector3 } from "three";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ref, shallowReactive } from "vue";

const { camera, onBeforeRender } = vi.hoisted(() => ({
  camera: { value: { position: { x: 0, z: 0 } } },
  onBeforeRender: vi.fn<(callback: () => void) => void>(),
}));

vi.mock(import("@tresjs/core"), () => ({
  useLoop: () => ({ onBeforeRender }) as unknown as ReturnType<typeof useLoop>,
  useTres: () => ({ camera }) as unknown as ReturnType<typeof useTres>,
}));
vi.mock(import("#src/services/chest/readRegionChestPlaces"));
vi.mock(import("#src/services/world/readLoadedRegion"));
// No ground piece is laid over either region, so the only reads the camera makes are the regions' own
vi.mock(import("#src/services/world/selectLaidGroundKeys"), () => ({ selectLaidGroundKeys: () => [] }));

// The reads the composable makes are in the background, so they settle on the next turn of the event loop
const waitForReads = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

// Each frame runs the callbacks the composable registered on the loop
const renderFrame = () => {
  for (const [render] of onBeforeRender.mock.calls) render();
};

// A square of a hundred metres centred on the point
const createSquare = (x: number, z: number): GroundPoint[] => [
  { x: x - 50, z: z - 50 },
  { x: x + 50, z: z - 50 },
  { x: x + 50, z: z + 50 },
  { x: x - 50, z: z + 50 },
];
const createArea = (id: string, outline: GroundPoint[]) => ({
  id,
  layer: WorldLayer.Surface,
  name: id,
  outline,
  subareas: [],
  subregion: "",
  weathers: [],
});
// A region with nothing in it, so the only read a region makes in this test is its chest record
const createLoadedRegion = (id: string): LoadedRegion => ({
  enemyCamps: [],
  goToPlaces: [],
  id,
  landmarks: [],
  outcropPlaces: [],
  regionPalettes: {},
  residents: [],
  rivers: [],
  waterfalls: [],
});

describe(useRegionData, () => {
  beforeEach(() => {
    camera.value = { position: { x: 0, z: 0 } };
    vi.stubGlobal("ref", ref);
    vi.stubGlobal("shallowReactive", shallowReactive);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  // The regions are the lock's own, so each one's chest record is named by its key
  const NEAR_REGION_ID = "mondstadt";
  const FAR_REGION_ID = "liyue";
  // Dragonspine lies in reach beside Mondstadt, and the lock holds no chest record for it
  const NO_RECORD_REGION_ID = "dragonspine";
  const FAR_POSITION = { x: 10_050, z: 10_050 };
  const CHEST = { id: "made-up-chest", kind: ChestKind.Common, position: { x: 10, z: 10 } };
  const catalogue: Catalogue = {
    regions: [
      { areas: [createArea("made-up-area", createSquare(0, 0))], id: NEAR_REGION_ID, name: NEAR_REGION_ID },
      {
        areas: [createArea("made-up-no-record-area", createSquare(0, 0))],
        id: NO_RECORD_REGION_ID,
        name: NO_RECORD_REGION_ID,
      },
      {
        areas: [createArea("made-up-far-area", createSquare(FAR_POSITION.x, FAR_POSITION.z))],
        id: FAR_REGION_ID,
        name: FAR_REGION_ID,
      },
    ],
  };

  test("a region's chest record is read once in reach and kept after", async () => {
    expect.hasAssertions();

    vi.mocked(readLoadedRegion).mockImplementation((_regionDataBaseUrl, _gameDataBaseUrl, id) =>
      Promise.resolve(createLoadedRegion(id)),
    );
    vi.mocked(readRegionChestPlaces).mockResolvedValue([CHEST]);
    const { regionChestMap } = useRegionData(new Vector3(), "regions", "game-data", catalogue);
    renderFrame();
    await waitForReads();

    expect(readRegionChestPlaces).toHaveBeenCalledExactlyOnceWith("game-data", "chests/mondstadt");

    camera.value = { position: FAR_POSITION };
    renderFrame();
    await waitForReads();

    expect({
      calls: vi.mocked(readRegionChestPlaces).mock.calls,
      keys: [...regionChestMap.keys()],
      nearChests: regionChestMap.get(NEAR_REGION_ID),
    }).toStrictEqual({
      calls: [
        ["game-data", "chests/mondstadt"],
        ["game-data", "chests/liyue"],
      ],
      keys: [NEAR_REGION_ID, FAR_REGION_ID],
      nearChests: [CHEST],
    });
  });

  test("a region with no published chest record offers no chest", async () => {
    expect.hasAssertions();

    vi.mocked(readLoadedRegion).mockImplementation((_regionDataBaseUrl, _gameDataBaseUrl, id) =>
      Promise.resolve(createLoadedRegion(id)),
    );
    vi.mocked(readRegionChestPlaces).mockResolvedValue([CHEST]);
    const { regionChestMap } = useRegionData(new Vector3(), "regions", "game-data", catalogue);
    renderFrame();
    await waitForReads();

    expect({
      calls: vi.mocked(readRegionChestPlaces).mock.calls,
      hasNoRecordRegion: regionChestMap.has(NO_RECORD_REGION_ID),
    }).toStrictEqual({ calls: [["game-data", "chests/mondstadt"]], hasNoRecordRegion: false });
  });
});
