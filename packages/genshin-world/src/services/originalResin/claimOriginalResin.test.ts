import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Currency } from "#src/models/inventory/Currency";
import { computeAdventureExpAtRank } from "#src/services/adventureRank/computeAdventureExpAtRank";
import { MAX_ADVENTURE_RANK, MORA_PER_EXCESS_ADVENTURE_EXP } from "#src/services/adventureRank/constants";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { claimOriginalResin } from "#src/services/originalResin/claimOriginalResin";
import { ADVENTURE_EXP_PER_RESIN } from "#src/services/originalResin/constants";
import { describe, expect, test } from "vitest";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);

describe(claimOriginalResin, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const noQuest = new Set<string>();
  const wallet = { ...EMPTY_WALLET, [Currency.OriginalResin]: 100 };
  const resin = 20;

  test("a claim spends its resin and gives five Adventure EXP a point", () => {
    expect.hasAssertions();

    expect(claimOriginalResin(adventureRankTables, wallet, resin, 0, noQuest, epoch)).toStrictEqual({
      adventureExp: resin * ADVENTURE_EXP_PER_RESIN,
      wallet: { ...wallet, [Currency.OriginalResin]: 100 - resin },
    });
  });

  test("the Mora that Adventure EXP past rank 60 pays goes into the wallet", () => {
    expect.hasAssertions();

    const maxAdventureExp = computeAdventureExpAtRank(adventureRankTables.levels, MAX_ADVENTURE_RANK);
    const excessAdventureExp = resin * ADVENTURE_EXP_PER_RESIN;
    const ascensionQuests = new Set(["25001", "25005", "25009", "25011"]);

    expect(
      claimOriginalResin(adventureRankTables, wallet, resin, maxAdventureExp, ascensionQuests, epoch),
    ).toStrictEqual({
      adventureExp: maxAdventureExp,
      wallet: {
        ...wallet,
        [Currency.Mora]: excessAdventureExp * MORA_PER_EXCESS_ADVENTURE_EXP,
        [Currency.OriginalResin]: 100 - resin,
      },
    });
  });

  test("a claim the resin does not cover is refused, and nothing is spent", () => {
    expect.hasAssertions();

    expect(claimOriginalResin(adventureRankTables, wallet, 101, 0, noQuest, epoch)).toBeUndefined();
  });
});
