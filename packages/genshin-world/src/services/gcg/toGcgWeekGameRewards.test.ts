import type { ResidentWeekGame } from "#src/models/world/Resident";

import { GCG_LUCKY_COIN_ITEM_ID, GCG_PLAYER_EXP_ITEM_ID } from "#src/services/gcg/constants";
import { toGcgWeekGameRewards } from "#src/services/gcg/toGcgWeekGameRewards";
import { describe, expect, test } from "vitest";

describe(toGcgWeekGameRewards, () => {
  test("a week game pays its week's Player EXP and Lucky Coins at the level it is offered at", () => {
    expect.hasAssertions();

    const weekGame: ResidentWeekGame = { gameId: 1103, gcgLevel: 5, luckyCoins: 900, playerExp: 200 };

    expect(toGcgWeekGameRewards(weekGame)).toStrictEqual([
      { count: 200, id: GCG_PLAYER_EXP_ITEM_ID },
      { count: 900, id: GCG_LUCKY_COIN_ITEM_ID },
    ]);
  });
});
