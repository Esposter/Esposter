import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Currency } from "#src/models/inventory/Currency";
import { computeAdventureExpAtRank } from "#src/services/adventureRank/computeAdventureExpAtRank";
import { MAX_ADVENTURE_RANK, MORA_PER_EXCESS_ADVENTURE_EXP } from "#src/services/adventureRank/constants";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { EMPTY_INVENTORY } from "#src/services/inventory/constants";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { readGenshinSave } from "#src/services/save/readGenshinSave";
import { useWorldAdventureRankStore } from "#src/store/adventureRank";
import { finishTestMainQuests } from "#src/store/quests.fixture";
import { startTestWorldSession } from "#src/store/session.fixture";
import { describe, expect, test, vi } from "vitest";
import { nextTick } from "vue";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);

describe(useWorldAdventureRankStore, () => {
  const savedState = readGenshinSave(EMPTY_GENSHIN_SAVE, {}, new Map(), new Map(), new Map());
  const ascensionQuestIds = new Set([25_001, 25_005, 25_009, 25_011]);
  const maxAdventureExp = computeAdventureExpAtRank(adventureRankTables.levels, MAX_ADVENTURE_RANK);
  const GAIN = 100;
  const noFinishedMainQuestIds = new Set<number>();

  const createAdventureRank = (savedAdventureExp: number, finishedMainQuestIds: ReadonlySet<number>) => {
    const worldSessionStore = startTestWorldSession(
      { getWorldNow: () => Temporal.Instant.fromEpochMilliseconds(0) },
      { inventory: { ...EMPTY_INVENTORY }, wallet: savedState.wallet },
    );
    finishTestMainQuests(...finishedMainQuestIds);
    const worldAdventureRankStore = useWorldAdventureRankStore();
    worldAdventureRankStore.start(adventureRankTables, {
      adventureExp: savedAdventureExp,
      adventureRankRewardsClaimed: [],
      worldLevelAdjustment: savedState.worldLevelAdjustment,
    });
    return {
      adventureRank: worldAdventureRankStore,
      setFinishedMainQuestIds: (nextFinishedMainQuestIds: ReadonlySet<number>) => {
        finishTestMainQuests(...nextFinishedMainQuestIds);
      },
      worldSessionStore,
    };
  };

  test("a gain of 375 from none reaches rank 2", () => {
    expect.hasAssertions();

    const { adventureRank } = createAdventureRank(0, noFinishedMainQuestIds);
    adventureRank.gainWorldAdventureExp(375);

    expect(adventureRank.adventureExp).toBe(375);
    expect(adventureRank.rank).toBe(2);
  });

  test("a gain past the World Level 1 hold leaves the rank at 25 while its ascension quest is not done", () => {
    expect.hasAssertions();

    const { adventureRank } = createAdventureRank(maxAdventureExp, noFinishedMainQuestIds);
    adventureRank.gainWorldAdventureExp(GAIN);

    expect(adventureRank.rank).toBe(25);
    expect(adventureRank.adventureExp).toBe(maxAdventureExp);
  });

  test("a gain past rank 60's total with every ascension quest done pays Mora into the wallet", () => {
    expect.hasAssertions();

    const { adventureRank, worldSessionStore } = createAdventureRank(maxAdventureExp, ascensionQuestIds);
    adventureRank.gainWorldAdventureExp(GAIN);

    expect(worldSessionStore.wallet[Currency.Mora]).toBe(
      savedState.wallet[Currency.Mora] + GAIN * MORA_PER_EXCESS_ADVENTURE_EXP,
    );
  });

  test("a world level reached raises its event once for each level", async () => {
    expect.hasAssertions();

    const worldLevelUps = vi.fn<(worldLevel: number) => void>();
    const { adventureRank, setFinishedMainQuestIds, worldSessionStore } = createAdventureRank(
      maxAdventureExp,
      noFinishedMainQuestIds,
    );
    // The first World Level the store reaches as it starts is the watch's own to take in, a tick before the quests change
    await nextTick();
    worldSessionStore.events.on("worldLevelUp", worldLevelUps);
    const startingWorldLevel = adventureRank.worldLevel;
    setFinishedMainQuestIds(ascensionQuestIds);
    await nextTick();

    const finalWorldLevel = adventureRank.worldLevel;
    expect(finalWorldLevel).toBeGreaterThan(startingWorldLevel);
    expect(worldLevelUps.mock.calls).toStrictEqual(
      Array.from({ length: finalWorldLevel - startingWorldLevel }, (_value, index) => [startingWorldLevel + index + 1]),
    );
  });
});
