import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { ClearedCamp } from "#src/models/exploration/ClearedCamp";
import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { Catalogue } from "#src/models/world/Catalogue";

import { useWorldDoings } from "#src/composables/useWorldDoings";
import { GameDataKeys } from "#src/generated/gameDataKeys";
import { ChestKind } from "#src/models/chest/ChestKind";
import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { PuzzleKind } from "#src/models/puzzle/PuzzleKind";
import { SeelieState } from "#src/models/puzzle/SeelieState";
import { WorldLayer } from "#src/models/world/WorldLayer";
import { readRegionChestPlaces } from "#src/services/chest/readRegionChestPlaces";
import { getGameDataRecordPath } from "#src/services/data/getGameDataRecordPath";
import { readGameDataObject } from "#src/services/data/readGameDataObject";
import { computeExplorationProgress } from "#src/services/exploration/computeExplorationProgress";
import { computeExploredDoingIds } from "#src/services/exploration/computeExploredDoingIds";
import { ExplorationKindWeightMap } from "#src/services/exploration/ExplorationKindWeightMap";
import { placeExplorationDoings } from "#src/services/exploration/placeExplorationDoings";
import { useWorldAdventureRankStore } from "#src/store/adventureRank";
import { useWorldChestsStore } from "#src/store/chests";
import { startTestWorldGround } from "#src/store/ground.fixture";
import { useWorldPuzzlesStore } from "#src/store/puzzles";
import { startTestWorldSession } from "#src/store/session.fixture";
import { storeToRefs } from "pinia";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ref, shallowReactive } from "vue";

// Each region's record is served from the fetch the reader makes, so a record is read through its reader and its schema
const { pathRecordsMap } = vi.hoisted(() => ({ pathRecordsMap: new Map<string, unknown[]>() }));

vi.mock(import("#src/services/data/readGameDataObject"), async (importOriginal) => {
  const { readGameDataObject: readHostedObject } = await importOriginal();
  return {
    readGameDataObject: vi.fn<(gameDataBaseUrl: string, objectPath: string) => Promise<unknown>>(
      (gameDataBaseUrl, objectPath) =>
        // A record the suite registers is served from the map, and any other hosted record is read as the shared
        // Fixtures read it when this suite loads, before any record is registered
        pathRecordsMap.has(objectPath)
          ? Promise.resolve(pathRecordsMap.get(objectPath))
          : readHostedObject(gameDataBaseUrl, objectPath),
    ),
  };
});

const createChests = (puzzleOptions: Parameters<ReturnType<typeof useWorldPuzzlesStore>["start"]>[0]) => {
  startTestWorldSession();
  startTestWorldGround();
  const worldPuzzlesStore = useWorldPuzzlesStore();
  worldPuzzlesStore.start(puzzleOptions);
  const worldAdventureRankStore = useWorldAdventureRankStore();
  vi.spyOn(worldAdventureRankStore, "gainWorldAdventureExp").mockImplementation(() => {});
  // The scene's region chest map, which the session hands in as a getter and each record enters as it arrives
  const regionChestMap = shallowReactive(new Map<string, ChestPlace[]>());
  const worldChestsStore = useWorldChestsStore();
  worldChestsStore.start({ getRegionChestMap: () => regionChestMap, openedChestIds: new Set(), waterLevel: -1 });
  const { chestInteractables, openedChestIds } = storeToRefs(worldChestsStore);
  const { openChestById } = worldChestsStore;
  return { chestInteractables, openChestById, openedChestIds, regionChestMap };
};

describe(useWorldChestsStore, () => {
  afterEach(() => {
    pathRecordsMap.clear();
    vi.clearAllMocks();
  });

  const SEELIE_ID = "settled";
  const SEELIE_CHEST_ID = `seelie-chest-${SEELIE_ID}`;
  const LIYUE_REGION_ID = "liyue";
  const LIYUE_CHEST_ID = "chest-liyue";
  const LIYUE_CHESTS_PATH = getGameDataRecordPath(GameDataKeys.chests.liyue);
  const TIME_TRIAL_ID = "time-trial";
  const puzzleOptions: Parameters<ReturnType<typeof useWorldPuzzlesStore>["start"]>[0] = {
    monumentPlaces: [],
    savedSettledSeelieIds: new Set([SEELIE_ID]),
    savedSolvedPuzzleIds: new Set(),
    seelies: [
      {
        court: { x: 10, z: 0 },
        id: SEELIE_ID,
        progress: 0,
        start: { x: 0, z: 0 },
        state: SeelieState.Resting,
        unfollowedSeconds: 0,
      },
    ],
    shrinePlaces: [],
    timeTrialPlaces: [],
  };

  test("an unopened chest in another region is offered to open", async () => {
    expect.hasAssertions();

    pathRecordsMap.set(LIYUE_CHESTS_PATH, [{ id: LIYUE_CHEST_ID, kind: ChestKind.Common, position: { x: 0, z: 0 } }]);
    const { chestInteractables, regionChestMap } = createChests({ ...puzzleOptions, seelies: [] });
    // Liyue's record is read once its region comes within reach, and the scene's region chest map holds it from then on
    // The store offers its chests from that map, with no copy of it kept beside it
    regionChestMap.set(LIYUE_REGION_ID, await readRegionChestPlaces("game-data", GameDataKeys.chests.liyue));

    expect(chestInteractables.value.map(({ id }) => id)).toStrictEqual([LIYUE_CHEST_ID]);
  });

  test("the world's start reads no chest record of a region outside reach", () => {
    expect.hasAssertions();

    pathRecordsMap.set(LIYUE_CHESTS_PATH, [{ id: LIYUE_CHEST_ID, kind: ChestKind.Common, position: { x: 0, z: 0 } }]);
    createChests({ ...puzzleOptions, seelies: [] });

    expect(readGameDataObject).not.toHaveBeenCalledWith(expect.anything(), LIYUE_CHESTS_PATH);
  });

  test("a Seelie's chest is offered once it settles", () => {
    expect.hasAssertions();

    const { chestInteractables } = createChests(puzzleOptions);

    expect(chestInteractables.value.map(({ id }) => id)).toStrictEqual([SEELIE_CHEST_ID]);
  });

  test("a Seelie's chest is kept opened by its own id", () => {
    expect.hasAssertions();

    const { chestInteractables, openChestById, openedChestIds } = createChests(puzzleOptions);
    openChestById(SEELIE_CHEST_ID, () => 0);

    expect({ chestInteractables: chestInteractables.value, openedChestIds: [...openedChestIds.value] }).toStrictEqual({
      chestInteractables: [],
      openedChestIds: [SEELIE_CHEST_ID],
    });
  });

  test("a chest stays locked while a puzzle within its reach is unsolved", () => {
    expect.hasAssertions();

    // The settled Seelie's court chest stands within the lock reach of this unsolved time trial
    const { chestInteractables } = createChests({
      ...puzzleOptions,
      timeTrialPlaces: [{ id: TIME_TRIAL_ID, kind: PuzzleKind.TimeTrialChallenge, position: { x: 0, z: 0 } }],
    });

    expect(chestInteractables.value.map(({ id }) => id)).toStrictEqual([]);
  });

  // A made-up square of catalogue area around the origin, where the Liyue chest stands
  const AREA_ID = "made-up-area";
  const catalogue: Catalogue = {
    regions: [
      {
        areas: [
          {
            id: AREA_ID,
            layer: WorldLayer.Surface,
            name: "Made-up Area",
            outline: [
              { x: -50, z: -50 },
              { x: 50, z: -50 },
              { x: 50, z: 50 },
              { x: -50, z: 50 },
            ],
            subareas: [],
            subregion: "",
            weathers: [],
          },
        ],
        id: LIYUE_REGION_ID,
        name: "Made-up Region",
      },
    ],
  };
  const area: ExplorationArea = { areaId: AREA_ID, doings: [], reputationRatio: 0, total: 100 };
  // The area's progress, counted the way the world counts its doings
  // The chests the store places, and the ids it records as opened
  const countAreaExploration = () => {
    const { placedDoings, recordedDoingIds } = useWorldDoings({
      clearedCamps: ref<ClearedCamp[]>([]),
      monumentPlaces: [],
      timeTrialPlaces: [],
    });

    return placeExplorationDoings([area], catalogue, placedDoings.value).map((placedArea) =>
      computeExplorationProgress(placedArea, computeExploredDoingIds(placedArea, [], recordedDoingIds.value)),
    );
  };

  test("an opened chest counts once toward its area's exploration", () => {
    expect.hasAssertions();

    const { openChestById, regionChestMap } = createChests({ ...puzzleOptions, seelies: [] });
    regionChestMap.set(LIYUE_REGION_ID, [{ id: LIYUE_CHEST_ID, kind: ChestKind.Common, position: { x: 0, z: 0 } }]);
    openChestById(LIYUE_CHEST_ID, () => 0);

    expect(countAreaExploration()).toStrictEqual([ExplorationKindWeightMap[ExplorationKind.Chest]]);
  });

  test("reopening a chest adds nothing to the count", () => {
    expect.hasAssertions();

    const { openChestById, regionChestMap } = createChests({ ...puzzleOptions, seelies: [] });
    regionChestMap.set(LIYUE_REGION_ID, [{ id: LIYUE_CHEST_ID, kind: ChestKind.Common, position: { x: 0, z: 0 } }]);
    openChestById(LIYUE_CHEST_ID, () => 0);
    const countAfterOpening = countAreaExploration();
    openChestById(LIYUE_CHEST_ID, () => 0);

    expect({ afterOpening: countAfterOpening, afterReopening: countAreaExploration() }).toStrictEqual({
      afterOpening: [ExplorationKindWeightMap[ExplorationKind.Chest]],
      afterReopening: [ExplorationKindWeightMap[ExplorationKind.Chest]],
    });
  });
});
