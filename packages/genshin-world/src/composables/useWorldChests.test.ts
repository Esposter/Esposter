import { useWorldChests } from "#src/composables/useWorldChests";
import { useWorldPuzzles } from "#src/composables/useWorldPuzzles";
import { SeelieState } from "#src/models/puzzle/SeelieState";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { describe, expect, test, vi } from "vitest";
import { ref, shallowRef } from "vue";

vi.mock(import("#src/services/chest/readMondstadtChestPlaces"), () => ({
  readMondstadtChestPlaces: () => Promise.resolve([]),
}));

const SEELIE_ID = "settled";
const SEELIE_CHEST_ID = `seelie-chest-${SEELIE_ID}`;

const createChests = (puzzleChestPlaces: Parameters<typeof useWorldChests>[0]["puzzleChestPlaces"]) => {
  const openedChestIds = shallowRef<ReadonlySet<string>>(new Set());
  return {
    openedChestIds,
    ...useWorldChests({
      events: createWorldEvents(),
      gainWorldAdventureExp: vi.fn<(amount: number) => void>(),
      gameDataBaseUrl: "",
      gameText: {},
      getGroundHeight: () => 0,
      inventory: ref({ ...EMPTY_INVENTORY }),
      materialDataMap: new Map(),
      nameText: {},
      openedChestIds,
      placeWorldDrops: vi.fn<() => void>(),
      puzzleChestPlaces,
      setInventory: vi.fn<() => void>(),
      setWallet: vi.fn<() => void>(),
      wallet: ref({ ...EMPTY_WALLET }),
      waterLevel: -1,
    }),
  };
};

describe("useWorldChests", () => {
  test("a Seelie's chest is offered once it settles", () => {
    expect.hasAssertions();

    const { puzzleChestPlaces } = useWorldPuzzles({
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
      timeTrialPlaces: [],
    });
    const { chestInteractables } = createChests(puzzleChestPlaces);

    expect(chestInteractables.value.map(({ id }) => id)).toStrictEqual([SEELIE_CHEST_ID]);
  });

  test("a Seelie's chest is kept opened by its own id", () => {
    expect.hasAssertions();

    const { puzzleChestPlaces } = useWorldPuzzles({
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
      timeTrialPlaces: [],
    });
    const { chestInteractables, openChestById, openedChestIds } = createChests(puzzleChestPlaces);
    openChestById(SEELIE_CHEST_ID, () => 0);

    expect({ chestInteractables: chestInteractables.value, openedChestIds: [...openedChestIds.value] }).toStrictEqual({
      chestInteractables: [],
      openedChestIds: [SEELIE_CHEST_ID],
    });
  });
});
