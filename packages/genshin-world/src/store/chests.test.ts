import { GameDataKeys } from "#src/generated/gameDataKeys";
import { ChestKind } from "#src/models/chest/ChestKind";
import { PuzzleKind } from "#src/models/puzzle/PuzzleKind";
import { SeelieState } from "#src/models/puzzle/SeelieState";
import { readRegionChestPlaces } from "#src/services/chest/readRegionChestPlaces";
import { readGameDataObject } from "#src/services/data/readGameDataObject";
import { useWorldAdventureRankStore } from "#src/store/adventureRank";
import { useWorldChestsStore } from "#src/store/chests";
import { startTestWorldGround } from "#src/store/ground.fixture";
import { useWorldPuzzlesStore } from "#src/store/puzzles";
import { startTestWorldSession } from "#src/store/session.fixture";
import { storeToRefs } from "pinia";
import { afterEach, describe, expect, test, vi } from "vitest";

// Each region's record is served from the fetch the reader makes, so a record is read through its reader and its schema
const { datasetRecordsMap } = vi.hoisted(() => ({ datasetRecordsMap: new Map<string, unknown[]>() }));

vi.mock(import("#src/services/data/readGameDataObject"), () => ({
  readGameDataObject: vi.fn<(gameDataBaseUrl: string, dataset: string, hash: string) => Promise<unknown>>(
    (_gameDataBaseUrl, dataset) => Promise.resolve(datasetRecordsMap.get(dataset) ?? []),
  ),
}));

const createChests = (puzzleOptions: Parameters<ReturnType<typeof useWorldPuzzlesStore>["start"]>[0]) => {
  startTestWorldSession();
  startTestWorldGround();
  const worldPuzzlesStore = useWorldPuzzlesStore();
  worldPuzzlesStore.start(puzzleOptions);
  const worldAdventureRankStore = useWorldAdventureRankStore();
  vi.spyOn(worldAdventureRankStore, "gainWorldAdventureExp").mockImplementation(() => {});
  const worldChestsStore = useWorldChestsStore();
  worldChestsStore.start({ openedChestIds: new Set(), waterLevel: -1 });
  const { chestInteractables, openedChestIds, regionChestPlaces } = storeToRefs(worldChestsStore);
  const { openChestById } = worldChestsStore;
  return { chestInteractables, openChestById, openedChestIds, regionChestPlaces };
};

describe(useWorldChestsStore, () => {
  afterEach(() => {
    datasetRecordsMap.clear();
    vi.clearAllMocks();
  });

  const SEELIE_ID = "settled";
  const SEELIE_CHEST_ID = `seelie-chest-${SEELIE_ID}`;
  const LIYUE_CHEST_ID = "chest-liyue";
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

    datasetRecordsMap.set("chests/liyue", [{ id: LIYUE_CHEST_ID, kind: ChestKind.Common, position: { x: 0, z: 0 } }]);
    const { chestInteractables, regionChestPlaces } = createChests({ ...puzzleOptions, seelies: [] });
    // Liyue's record is read once its region comes within reach, and the session hands it to the store as it arrives
    regionChestPlaces.value = await readRegionChestPlaces("game-data", GameDataKeys.chests.liyue);

    expect(chestInteractables.value.map(({ id }) => id)).toStrictEqual([LIYUE_CHEST_ID]);
  });

  test("the world's start reads no chest record of a region outside reach", () => {
    expect.hasAssertions();

    datasetRecordsMap.set("chests/liyue", [{ id: LIYUE_CHEST_ID, kind: ChestKind.Common, position: { x: 0, z: 0 } }]);
    createChests({ ...puzzleOptions, seelies: [] });

    expect(readGameDataObject).not.toHaveBeenCalledWith(expect.anything(), "chests/liyue", expect.anything());
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
});
