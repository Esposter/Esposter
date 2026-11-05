import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Currency } from "#src/models/inventory/Currency";
import { computeAdventureExpAtRank } from "#src/services/adventureRank/computeAdventureExpAtRank";
import { MAX_ADVENTURE_RANK, MORA_PER_EXCESS_ADVENTURE_EXP } from "#src/services/adventureRank/constants";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { ADVENTURE_EXP_PER_RESIN } from "#src/services/originalResin/constants";
import { routeRewardItems } from "#src/services/reward/routeRewardItems";
import { describe, expect, test } from "vitest";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);

describe(routeRewardItems, () => {
  const RESIN = 20;
  const ascensionQuests = new Set(["25001", "25005", "25009", "25011"]);

  test("the Mora that Adventure EXP past rank 60 pays goes into the wallet", () => {
    expect.hasAssertions();

    const maxAdventureExp = computeAdventureExpAtRank(adventureRankTables.levels, MAX_ADVENTURE_RANK);
    const gainedAdventureExp = RESIN * ADVENTURE_EXP_PER_RESIN;

    expect(
      routeRewardItems(
        adventureRankTables,
        maxAdventureExp,
        gainedAdventureExp,
        ascensionQuests,
        EMPTY_WALLET,
        EMPTY_INVENTORY,
        [],
        {},
        new Map(),
      ),
    ).toStrictEqual({
      adventureExp: maxAdventureExp,
      inventory: EMPTY_INVENTORY,
      wallet: { ...EMPTY_WALLET, [Currency.Mora]: gainedAdventureExp * MORA_PER_EXCESS_ADVENTURE_EXP },
    });
  });
});
