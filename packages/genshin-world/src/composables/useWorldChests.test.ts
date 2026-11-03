import { useWorldChests } from "#src/composables/useWorldChests";
import { SeelieState } from "#src/models/puzzle/SeelieState";
import { useWorldAdventureRankStore } from "#src/store/adventureRank";
import { startTestWorldGround } from "#src/store/ground.fixture";
import { useWorldPuzzlesStore } from "#src/store/puzzles";
import { startTestWorldSession } from "#src/store/session.fixture";
import { describe, expect, test, vi } from "vitest";
import { shallowRef } from "vue";

vi.mock(import("#src/services/chest/readMondstadtChestPlaces"), () => ({
  readMondstadtChestPlaces: () => Promise.resolve([]),
}));

const createChests = (puzzleOptions: Parameters<ReturnType<typeof useWorldPuzzlesStore>["start"]>[0]) => {
  startTestWorldSession();
  startTestWorldGround();
  const worldPuzzlesStore = useWorldPuzzlesStore();
  worldPuzzlesStore.start(puzzleOptions);
  const worldAdventureRankStore = useWorldAdventureRankStore();
  vi.spyOn(worldAdventureRankStore, "gainWorldAdventureExp").mockImplementation(() => {});
  const openedChestIds = shallowRef<ReadonlySet<string>>(new Set());
  return { openedChestIds, ...useWorldChests({ openedChestIds, waterLevel: -1 }) };
};

describe(useWorldChests, () => {
  const SEELIE_ID = "settled";
  const SEELIE_CHEST_ID = `seelie-chest-${SEELIE_ID}`;
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
});
