import ExpeditionLoader from "#src/components/Expedition/Loader/Index.vue";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { ENGLISH_GAME_TEXT } from "genshin-text";
import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

describe("expeditionLoader", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The hosted data is unreachable from this base, so the read fails on the way in, and the failure is logged
  // Rather than left unhandled
  test("should log a failed read of the expedition data", async () => {
    expect.hasAssertions();

    const logged = new Promise<unknown>((resolve) => {
      vi.spyOn(console, "error").mockImplementation(resolve);
    });
    render(ExpeditionLoader, {
      props: {
        adventureRank: 1,
        characterPassiveGroupIdMap: new Map(),
        characters: [],
        completedQuestIds: new Set<string>(),
        downCharacterIds: new Set<number>(),
        expeditions: [],
        gameDataBaseUrl: "/unreachable-game-data",
        gameText: ENGLISH_GAME_TEXT,
        inventory: { items: [], nextId: 1, quickSwapItemIds: [] },
        materialDataMap: new Map(),
        nameText: {},
        now: Temporal.Instant.fromEpochMilliseconds(0),
        random: () => 0,
        regionStatueProgressMap: new Map(),
        wallet: EMPTY_WALLET,
      },
    });

    await expect(logged).resolves.toBeInstanceOf(Error);
  });
});
