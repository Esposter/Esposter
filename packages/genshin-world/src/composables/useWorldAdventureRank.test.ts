import { useWorldAdventureRank } from "#src/composables/useWorldAdventureRank";
import { Currency } from "#src/models/inventory/Currency";
import { computeAdventureExpAtRank } from "#src/services/adventureRank/computeAdventureExpAtRank";
import { MAX_ADVENTURE_RANK, MORA_PER_EXCESS_ADVENTURE_EXP } from "#src/services/adventureRank/constants";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { readGenshinSave } from "#src/services/save/readGenshinSave";
import { describe, expect, test } from "vitest";
import { computed, ref } from "vue";

describe(useWorldAdventureRank, () => {
  const savedState = readGenshinSave(EMPTY_GENSHIN_SAVE, {}, new Map());
  const ascensionQuestIds = new Set([25_001, 25_005, 25_009, 25_011]);
  const maxAdventureExp = computeAdventureExpAtRank(MAX_ADVENTURE_RANK);
  const GAIN = 100;

  const createAdventureRank = (savedAdventureExp: number, finishedMainQuestIds: ReadonlySet<number>) => {
    const wallet = ref(savedState.wallet);
    const adventureRank = useWorldAdventureRank({
      finishedMainQuestIds: computed(() => finishedMainQuestIds),
      getWorldNow: () => Temporal.Now.instant(),
      savedAdventureExp,
      savedWorldLevelAdjustment: savedState.worldLevelAdjustment,
      setWallet: (nextWallet) => {
        wallet.value = nextWallet;
      },
      wallet,
    });
    return { adventureRank, wallet };
  };

  test("a gain of 375 from none reaches rank 2", () => {
    expect.hasAssertions();

    const { adventureRank } = createAdventureRank(0, new Set());
    adventureRank.gainWorldAdventureExp(375);

    expect(adventureRank.adventureExp.value).toBe(375);
    expect(adventureRank.rank.value).toBe(2);
  });

  test("a gain past the World Level 1 hold leaves the rank at 25 while its ascension quest is not done", () => {
    expect.hasAssertions();

    const { adventureRank } = createAdventureRank(maxAdventureExp, new Set());
    adventureRank.gainWorldAdventureExp(GAIN);

    expect(adventureRank.rank.value).toBe(25);
    expect(adventureRank.adventureExp.value).toBe(maxAdventureExp);
  });

  test("a gain past rank 60's total with every ascension quest done pays Mora into the wallet", () => {
    expect.hasAssertions();

    const { adventureRank, wallet } = createAdventureRank(maxAdventureExp, ascensionQuestIds);
    adventureRank.gainWorldAdventureExp(GAIN);

    expect(wallet.value[Currency.Mora]).toBe(savedState.wallet[Currency.Mora] + GAIN * MORA_PER_EXCESS_ADVENTURE_EXP);
  });
});
